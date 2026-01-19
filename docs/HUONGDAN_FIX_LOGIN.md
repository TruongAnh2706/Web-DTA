# 🚑 KHẮC PHỤC LỖI TRẮNG MÀN HÌNH (FINAL FIX)

Nguyên nhân chính xác: **Lỗi vòng lặp vô tận (Infinite Recursion)** trong Database.
Khi Admin cố gắng xem danh sách quyền, Database lại hỏi "Bạn có phải Admin không?", và câu hỏi này lại kích hoạt lại việc kiểm tra quyền... cứ thế lặp lại mãi mãi gây treo máy.

### Bước 1: Mở SQL Editor
Link: https://supabase.com/dashboard/project/zlsyyhqtggyhmvnbaoac/sql/new

### Bước 2: Copy & Chạy (Fix Triệt Để)
Copy toàn bộ code từ file `supabase/migrations/03_fix_rls.sql` (tôi vừa cập nhật) và chạy.

Script này sẽ:
1.  Tạo function `is_admin()` đặc biệt để kiểm tra quyền mà không kích hoạt RLS (phá vỡ vòng lặp).
2.  Cập nhật lại chính sách bảo mật để sử dụng function này.
3.  Cấp quyền thực thi cho mọi người dùng đã đăng nhập.

### Bước 3: Thử lại (QUAN TRỌNG)
1.  Vào trang Web.
2.  Nhấn F5 để tải lại.
3.  Thử Login hoặc vào trang Admin. Lần này chắc chắn sẽ được!
