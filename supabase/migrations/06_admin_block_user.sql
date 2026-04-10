-- =============================================
-- Migration: Thêm trạng thái is_blocked cho Admin Users
-- Chạy lệnh này trên Supabase SQL Editor
-- =============================================

DROP FUNCTION IF EXISTS get_admin_users();

CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
    id UUID,
    email VARCHAR(255),
    system_role TEXT,
    balance DECIMAL(10, 2),
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    account_type TEXT,
    subscription_level TEXT,
    is_blocked BOOLEAN
)
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Check Admin using qualified column names to avoid ambiguity
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        au.id,
        au.email::VARCHAR(255),
        COALESCE(ur.role, 'user') AS system_role,
        COALESCE(uw.balance, 0.00),
        au.created_at,
        au.last_sign_in_at,
        COALESCE((au.raw_user_meta_data->>'account_type')::TEXT, 'Free'),
        COALESCE((au.raw_user_meta_data->>'subscription_level')::TEXT, 'None'),
        COALESCE((au.raw_user_meta_data->>'is_blocked')::BOOLEAN, false) AS is_blocked
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.user_wallets uw ON au.id = uw.user_id
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;
