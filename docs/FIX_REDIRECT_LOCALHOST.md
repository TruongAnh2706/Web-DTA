# Hướng dẫn Sửa lỗi Đăng nhập bị chuyển về Localhost

Vấn đề bạn đang gặp phải ("đăng nhập xong thì hiện localhost") là do cấu hình trong **Supabase Authentication** đang đặt địa chỉ mặc định là Localhost thay vì địa chỉ trang web thực tế của bạn trên Vercel.

Khi bạn đăng nhập bằng Google, Supabase sẽ chuyển hướng người dùng về "Site URL" mặc định nếu địa chỉ hiện tại không nằm trong danh sách được phép, hoặc nếu "Site URL" đang được đặt là localhost.

## Các bước khắc phục

1.  Truy cập vào **Supabase Dashboard** của dự án.
2.  Vào mục **Authentication** (biểu tượng người dùng ở thanh bên trái).
3.  Chọn **URL Configuration**.
4.  Tại phần **Site URL**:
    *   Đổi `http://localhost:8080` (hoặc `3000`) thành: `https://dta-studio.vercel.app`
5.  Tại phần **Redirect URLs**:
    *   Nhấn **Add URL** và thêm các dòng sau để hỗ trợ cả môi trường thật và local:
        *   `https://dta-studio.vercel.app/**`
        *   `http://localhost:8080/**` (để bạn vẫn code được trên máy)
6.  Nhấn **Save**.

## Kiểm tra lại

Sau khi lưu cấu hình trên Supabase:
1.  Quay lại trang `https://dta-studio.vercel.app`.
2.  Đăng xuất (nếu đang bị kẹt ở trạng thái đăng nhập lỗi).
3.  Thử Đăng nhập lại bằng Google.
4.  Hệ thống sẽ chuyển hướng đúng về `https://dta-studio.vercel.app`.
