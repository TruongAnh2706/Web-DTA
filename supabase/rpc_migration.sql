-- Hàm RPC để Admin cập nhật metadata người dùng (Account Type, Subscription Level)
-- Chạy lệnh này trong Supabase SQL Editor

-- 1. Tạo hàm admin_update_user_metadata
CREATE OR REPLACE FUNCTION admin_update_user_metadata(
  target_user_id UUID,
  new_metadata JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền của người tạo hàm (postgres/service_role)
AS $$
DECLARE
  updated_metadata JSONB;
BEGIN
  -- Kiểm tra quyền: Chỉ cho phép admin thực thi (hoặc role service_role)
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access Denied: Only Admins can perform this action';
  END IF;

  -- Cập nhật raw_user_meta_data trong bảng auth.users
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || new_metadata
  WHERE id = target_user_id
  RETURNING raw_user_meta_data INTO updated_metadata;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN updated_metadata;
END;
$$;
