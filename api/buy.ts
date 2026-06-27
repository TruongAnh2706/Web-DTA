import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Chỉ cho phép POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ status: 'error', msg: 'Phương thức không được hỗ trợ' });
  }

  const apiKey = process.env.SHOPMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: 'error', msg: 'Chưa cấu hình API Key ShopMini trên Server' });
  }

  // 1. Xác thực đăng nhập qua token trong header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', msg: 'Yêu cầu đăng nhập tài khoản DTA' });
  }
  const token = authHeader.split(' ')[1];

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ status: 'error', msg: 'Thiếu cấu hình kết nối Database Supabase' });
  }

  // Khởi tạo client dùng anon key để xác thực token của user trước
  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ status: 'error', msg: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }

  const { id, amount } = req.body || {};
  if (!id || !amount) {
    return res.status(400).json({ status: 'error', msg: 'Thiếu thông tin sản phẩm hoặc số lượng' });
  }

  const buyAmount = parseInt(amount, 10);
  if (isNaN(buyAmount) || buyAmount <= 0) {
    return res.status(400).json({ status: 'error', msg: 'Số lượng mua không hợp lệ' });
  }

  try {
    // 2. Lấy thông tin variant chi tiết từ ShopMini để lấy giá gốc thật và tồn kho thật
    const variantRes = await fetch(`https://shopmini.net/api/product.php?api_key=${apiKey}&product=${id}`);
    if (!variantRes.ok) {
      return res.status(variantRes.status).json({
        status: 'error',
        msg: `Không thể kiểm tra sản phẩm từ ShopMini (Mã lỗi: ${variantRes.status})`
      });
    }

    const variantData = await variantRes.json();
    if (variantData.status !== 'success' || !variantData.data) {
      return res.status(400).json({
        status: 'error',
        msg: variantData.msg || 'Sản phẩm không tồn tại hoặc đã bị ẩn'
      });
    }

    const shopProduct = variantData.data;
    if (shopProduct.status !== 'active') {
      return res.status(400).json({ status: 'error', msg: 'Sản phẩm này hiện đang ngưng bán' });
    }

    const availableStock = parseInt(shopProduct.amount, 10);
    if (availableStock < buyAmount) {
      return res.status(400).json({ status: 'error', msg: `Kho hàng chỉ còn lại ${availableStock} sản phẩm` });
    }

    // 3. Tính toán giá bán của DTA: Nhân 1.15 và làm tròn
    const originalPrice = parseFloat(shopProduct.price);
    const dtaPrice = Math.round(originalPrice * 1.15);
    const totalCost = dtaPrice * buyAmount;

    // 4. Khởi tạo DB client tùy thuộc vào Key (Có service key bypass RLS thì tốt, không thì dùng anon key được ủy quyền)
    const useAdmin = !!supabaseServiceKey;
    const dbClient = createClient(
      supabaseUrl, 
      supabaseServiceKey || supabaseAnonKey,
      {
        global: {
          headers: !useAdmin ? { Authorization: `Bearer ${token}` } : undefined
        }
      }
    );

    // 5. Kiểm tra ví của người dùng DTA
    const { data: wallet, error: walletError } = await dbClient
      .from('user_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (walletError) {
      console.error('Error fetching user wallet:', walletError);
      return res.status(500).json({ status: 'error', msg: 'Không thể truy vấn số dư ví DTA' });
    }

    const currentBalance = wallet ? parseFloat(wallet.balance) : 0;
    if (currentBalance < totalCost) {
      return res.status(400).json({ 
        status: 'error', 
        msg: `Số dư ví DTA của bạn không đủ. Cần ${totalCost.toLocaleString('vi-VN')} VNĐ, hiện có ${currentBalance.toLocaleString('vi-VN')} VNĐ.` 
      });
    }

    // 6. Thực hiện trừ tiền & Tạo transaction tạm tính
    const { data: tx, error: txError } = await dbClient
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: -totalCost,
        status: 'completed', // Đặtcompleted, nếu lỗi sẽ cập nhật lại sau
        description: `Mua tài nguyên: ${shopProduct.name} (SL: ${buyAmount})`
      })
      .select()
      .single();

    if (txError) {
      console.error('Error inserting transaction:', txError);
      return res.status(500).json({ status: 'error', msg: 'Lỗi ghi nhận lịch sử giao dịch' });
    }

    // Cập nhật số dư ví
    const { error: walletUpdateError } = await dbClient
      .from('user_wallets')
      .update({ balance: currentBalance - totalCost })
      .eq('user_id', user.id);

    if (walletUpdateError) {
      console.warn('Direct wallet balance update error (relying on DB trigger if exists):', walletUpdateError);
    }

    // 7. Gọi API ShopMini mua hàng thật
    const formData = new URLSearchParams();
    formData.append('action', 'buyProduct');
    formData.append('id', id);
    formData.append('amount', buyAmount.toString());
    formData.append('api_key', apiKey);

    const shopRes = await fetch('https://shopmini.net/api/buy_product.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!shopRes.ok) {
      // HOÀN TIỀN CHO USER do lỗi API đối tác
      await dbClient
        .from('user_wallets')
        .update({ balance: currentBalance })
        .eq('user_id', user.id);
      
      await dbClient
        .from('transactions')
        .update({ status: 'failed', description: `[LỖI API] Mua tài nguyên thất bại: ${shopProduct.name}` })
        .eq('id', tx.id);

      return res.status(shopRes.status).json({ 
        status: 'error', 
        msg: `Lỗi kết nối ShopMini API khi mua hàng (Mã: ${shopRes.status})` 
      });
    }

    const shopData = await shopRes.json();

    if (shopData.status === 'success') {
      // Cập nhật chi tiết đơn hàng dạng JSON vào description của transaction để lưu lịch sử bàn giao tài nguyên
      const orderDetail = JSON.stringify({
        isResource: true,
        productName: shopProduct.name,
        variantName: shopProduct.name,
        amount: buyAmount,
        price: dtaPrice,
        shopminiTransId: shopData.trans_id,
        deliveredData: shopData.data
      });

      await dbClient
        .from('transactions')
        .update({ description: orderDetail })
        .eq('id', tx.id);

      // Giao dịch thành công! Trả kết quả về
      return res.status(200).json({
        status: 'success',
        msg: 'Mua tài nguyên thành công!',
        trans_id: shopData.trans_id,
        data: shopData.data
      });
    } else {
      // HOÀN TIỀN CHO USER do mua hàng thất bại ở đối tác (ví dụ: hết hàng đột xuất)
      await dbClient
        .from('user_wallets')
        .update({ balance: currentBalance })
        .eq('user_id', user.id);
      
      await dbClient
        .from('transactions')
        .update({ status: 'failed', description: `[THẤT BẠI] Mua thất bại: ${shopData.msg || 'Đối tác từ chối giao dịch'}` })
        .eq('id', tx.id);

      return res.status(400).json({
        status: 'error',
        msg: shopData.msg || 'Giao dịch đối tác thất bại, số dư của bạn đã được hoàn lại.'
      });
    }

  } catch (error: any) {
    console.error('Error in secure buy API:', error);
    return res.status(500).json({ 
      status: 'error', 
      msg: 'Lỗi hệ thống khi xử lý giao dịch: ' + (error.message || 'Không rõ nguyên nhân') 
    });
  }
}
