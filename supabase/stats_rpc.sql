-- Hàm đếm số liệu thống kê công khai (Tổng số User và Tổng số App)
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS TABLE (
    total_users BIGINT,
    total_apps BIGINT
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM public.apps WHERE is_active = true) as total_apps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cấp quyền gọi cho user ẩn danh (public)
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
