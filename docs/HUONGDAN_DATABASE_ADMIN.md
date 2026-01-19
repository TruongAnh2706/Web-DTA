# 👑 NÂNG CẤP TÍNH NĂNG ADMIN (FINAL FIX)

Lỗi "cannot change return type" là do Function cũ vẫn còn tồn tại. Ta cần **XÓA (DROP)** nó trước khi tạo lại.

### Bước 1: Mở SQL Editor & Xóa Hết Code Cũ
Link: https://supabase.com/dashboard/project/zlsyyhqtggyhmvnbaoac/sql/new

### Bước 2: Copy & Chạy (Đoạn code MỚI NHẤT này)
Đoạn code này đã thêm dòng `DROP FUNCTION IF EXISTS get_admin_users();` ở đầu.

Copy toàn bộ từ file `supabase/migrations/01_admin_features.sql` và chạy.

### Bước 3: Đảm bảo quyền Admin (QUAN TRỌNG)
Nếu bạn vẫn bị lỗi không load được user (hoặc chưa là admin), hãy chạy thêm đoạn này (nhớ thay Email):

```sql
DO $$
DECLARE
    target_email TEXT := 'EMAIL_CUA_BAN@GMAIL.COM'; -- <--- THAY EMAIL CỦA BẠN VÀO ĐÂY
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin access granted to %', target_email;
END $$;
```

Sau đó Refresh lại trang Admin.
