export default async function handler(req: any, res: any) {
  // Chỉ cho phép GET request
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: 'error', msg: 'Phương thức không được hỗ trợ' });
  }

  const apiKey = process.env.SHOPMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: 'error', msg: 'Chưa cấu hình API Key trên Server' });
  }

  try {
    const response = await fetch(`https://shopmini.net/api/profile.php?api_key=${apiKey}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        status: 'error', 
        msg: `Lỗi kết nối ShopMini API (Mã lỗi: ${response.status})` 
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in profile API:', error);
    return res.status(500).json({ 
      status: 'error', 
      msg: 'Lỗi server khi kết nối tới ShopMini: ' + (error.message || 'Không rõ nguyên nhân') 
    });
  }
}
