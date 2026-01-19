# 🗄️ HƯỚNG DẪN THIẾT LẬP DATABASE SUPABASE

## Vấn đề hiện tại
Sau khi đăng nhập Google thành công, màn hình "trống" vì các bảng database chưa được tạo:
- ❌ `apps` (404 Not Found)
- ❌ `user_roles` (404 Not Found)
- ❌ `user_wallets`, `transactions`, `licenses`

---

## Cách thiết lập (SIÊU ĐƠN GIẢN)

### Bước 1: Mở SQL Editor

1. Vào: https://supabase.com/dashboard/project/zlsyyhqtggyhmvnbaoac/sql/new
2. Đăng nhập nếu cần

### Bước 2: Copy toàn bộ SQL

1. Mở file: `supabase/migrations/00_initial_schema.sql`
2. **Copy TẤT CẢ** nội dung trong file (Ctrl+A, Ctrl+C)

### Bước 3: Chạy SQL

1. Paste vào SQL Editor trong Supabase Dashboard
2. Click nút **RUN** (góc dưới bên phải)
3. Đợi vài giây để hoàn thành

### Bước 4: Xác nhận

Kiểm tra xem các bảng đã được tạo:
1. Vào: https://supabase.com/dashboard/project/zlsyyhqtggyhmvnbaoac/editor
2. Bạn sẽ thấy 5 bảng mới:
   - ✅ `apps` (có 3 dòng dữ liệu demo)
   - ✅ `user_roles`
   - ✅ `user_wallets`
   - ✅ `transactions`
   - ✅ `licenses`

---

## Bước 5: Test lại website

1. Quay lại http://localhost:8080
2. Refresh trang (F5)
3. Bạn sẽ thấy:
   - ✅ Danh sách 3 ứng dụng demo hiển thị
   - ✅ Không còn màn hình trống
   - ✅ Đăng nhập/đăng xuất hoạt động bình thường

---

**Xong! Nếu vẫn gặp lỗi, chụp màn hình và báo lại cho tôi!** 🚀
