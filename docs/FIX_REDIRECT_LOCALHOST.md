# 🛠️ HƯỚNG DẪN SỬA LỖI REDIRECT VỀ LOCALHOST

Lỗi này xảy ra do **Supabase** chưa biết domain production của bạn (trên Vercel), nên sau khi đăng nhập Google xong, nó mặc định chuyển hướng về `localhost`.

Bạn cần làm theo các bước sau để khai báo domain chính thức.

---

### Bước 1: Lấy URL Vercel của bạn
1. Vào Dashboard Vercel của dự án.
2. Tại mục **Domains**, copy domain chính thức.
   - Ví dụ: `https://dta-studio.vercel.app`
   - (Hoặc domain custom nếu bạn đã gắn: `https://app.dtastudio.com`)

### Bước 2: Cài đặt trong Supabase Dashboard
1. Truy cập: [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn Project của bạn.
3. Ở menu bên trái, chọn **Authentication** -> **URL Configuration**.

#### 2.1. Cập nhật Site URL
- Tại ô **Site URL**, điền URL Vercel của bạn.
- Ví dụ: `https://dta-studio.vercel.app`

#### 2.2. Cập nhật Redirect URLs (RẤT QUAN TRỌNG)
- Tại mục **Redirect URLs**, bạn cần thêm tất cả các link sau:

1. `http://localhost:5173/**` (Để chạy local không lỗi)
2. `https://dta-studio.vercel.app/**` (Để chạy production không lỗi)
   *(Thay `dta-studio.vercel.app` bằng domain thực tế của bạn)*

> **Lưu ý**: Dấu `**` ở cuối rất quan trọng, nó cho phép tất cả các trang con đều hoạt động được.

4. Nhấn **Save**.

---

### Bước 3: Cài đặt Google Cloud Console (Nếu cần)
Nếu làm Bước 2 vẫn chưa được, hãy kiểm tra lại bên Google.

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Vào **APIs & Services** -> **Credentials**.
3. Chọn **OAuth 2.0 Client ID** mà bạn đang dùng.
4. Tại mục **Authorized redirect URIs**, đảm bảo LINK DUY NHẤT ở đây là link callback của Supabase:
   - `https://zlsyyhqtggyhmvnbaoac.supabase.co/auth/v1/callback`
   *(Tuyệt đối KHÔNG điền link vercel hay localhost ở đây)*

---

### Bước 4: Kiểm tra lại
1. Deploy lại code mới nhất lên Vercel (nếu có update code).
2. Vào trang web trên Vercel.
3. Nhấn F12 -> chọn tab **Console**.
4. Nhấn nút Đăng nhập Google.
5. Xem log: `[Auth] Redirecting to: ...` để xem code đang gửi link nào lên Supabase.
