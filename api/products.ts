import fs from 'fs';
import path from 'path';

interface CacheData {
  data: any;
  timestamp: number;
}

// Memory Cache cấp độ module cho danh sách sản phẩm chính
let productsCache: CacheData | null = null;
const CACHE_DURATION = 30 * 1000; // Cache 30 giây để tránh 429 và tối ưu hóa hiệu năng

export default async function handler(req: any, res: any) {
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: 'error', msg: 'Phương thức không được hỗ trợ' });
  }

  const { id } = req.query;

  // TRƯỜNG HỢP 1: Lấy chi tiết variants của 1 sản phẩm chính (Real-time)
  if (id) {
    const apiKey = process.env.SHOPMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ status: 'error', msg: 'Chưa cấu hình API Key trên Server' });
    }
    try {
      const response = await fetch(`https://shopmini.net/api/products.php?api_key=${apiKey}&id=${id}`);
      if (!response.ok) {
        return res.status(response.status).json({ 
          status: 'error', 
          msg: `ShopMini API returned status ${response.status}` 
        });
      }
      
      const data = await response.json();
      if (data.status === 'success' && data.product) {
        // Biến đổi các variants: nhân giá bán gốc với 1.15 (lời 15%) và làm tròn
        const processedVariants = (data.product.variants || []).map((variant: any) => {
          const originalPrice = parseFloat(variant.price) || 0;
          const newPrice = Math.round(originalPrice * 1.15); // Lời 15% và làm tròn
          
          return {
            ...variant,
            price: newPrice.toString(), // Thay đổi giá hiển thị
            originalPrice: originalPrice.toString(), // Giữ lại giá gốc
          };
        });

        return res.status(200).json({
          status: 'success',
          product: {
            ...data.product,
            variants: processedVariants
          }
        });
      } else {
        return res.status(404).json({ 
          status: 'error', 
          msg: data.msg || 'Không tìm thấy chi tiết sản phẩm này' 
        });
      }
    } catch (error: any) {
      console.error(`Error fetching product ID ${id}:`, error);
      return res.status(500).json({ 
        status: 'error', 
        msg: 'Lỗi server khi lấy chi tiết sản phẩm: ' + (error.message || 'Không rõ nguyên nhân') 
      });
    }
  }

  // TRƯỜNG HỢP 2: Lấy toàn bộ danh sách sản phẩm chính (Dùng cache + JSON tĩnh)
  const now = Date.now();
  if (productsCache && (now - productsCache.timestamp < CACHE_DURATION)) {
    return res.status(200).json(productsCache.data);
  }

  try {
    // Đọc từ file database tĩnh api/products_db.json (Dùng process.cwd() để tương thích ESM trên Vercel)
    const dbPath = path.join(process.cwd(), 'api', 'products_db.json');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ 
        status: 'error', 
        msg: 'Không tìm thấy cơ sở dữ liệu sản phẩm tĩnh products_db.json. Vui lòng chạy script cào sản phẩm.' 
      });
    }

    const fileContent = fs.readFileSync(dbPath, 'utf8');
    const allProducts = JSON.parse(fileContent);

    // Gom nhóm sản phẩm theo categories
    const categoriesMap = new Map<string, any>();

    for (const product of allProducts) {
      const categoryId = product.category_id || 'tai-nguyen-khac';
      const categoryName = product.category_name || 'Tài Nguyên Khác';

      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          products: []
        });
      }

      categoriesMap.get(categoryId).products.push(product);
    }

    const processedData = {
      status: "success",
      msg: "Lấy dữ liệu thành công!",
      categories: Array.from(categoriesMap.values())
    };

    // Lưu vào Cache
    productsCache = {
      data: processedData,
      timestamp: now
    };

    return res.status(200).json(processedData);
  } catch (error: any) {
    console.error('Error in products API:', error);
    if (productsCache) {
      console.warn('Lỗi đọc database tĩnh, sử dụng dữ liệu cache cũ');
      return res.status(200).json(productsCache.data);
    }
    return res.status(500).json({ 
      status: 'error', 
      msg: 'Lỗi server khi lấy danh sách sản phẩm: ' + (error.message || 'Không rõ nguyên nhân') 
    });
  }
}
