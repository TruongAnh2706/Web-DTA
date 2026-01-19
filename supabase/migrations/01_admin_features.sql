-- =============================================
-- Migration: Admin Features (User Management) - FIXED v3
-- =============================================

-- 1. Function lấy danh sách User (cho Admin)
-- Drop function cũ trước khi tạo lại vì ta đã đổi cấu trúc return
DROP FUNCTION IF EXISTS get_admin_users();

-- Rename output column 'role' to 'system_role' to avoid ambiguity with table columns
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
    id UUID,
    email VARCHAR(255),
    system_role TEXT, -- Renamed from role
    balance DECIMAL(10, 2),
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    account_type TEXT,
    subscription_level TEXT
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
        COALESCE((au.raw_user_meta_data->>'subscription_level')::TEXT, 'None')
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    LEFT JOIN public.user_wallets uw ON au.id = uw.user_id
    ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Function Update Wallet
CREATE OR REPLACE FUNCTION admin_update_wallet(
    target_user_id UUID,
    amount_change DECIMAL(10, 2),
    description TEXT
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_balance DECIMAL(10, 2);
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    INSERT INTO user_wallets (user_id, balance)
    VALUES (target_user_id, amount_change)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        balance = user_wallets.balance + amount_change,
        updated_at = NOW()
    RETURNING balance INTO new_balance;

    INSERT INTO transactions (user_id, type, amount, description, status)
    VALUES (
        target_user_id, 
        CASE WHEN amount_change >= 0 THEN 'deposit' ELSE 'purchase' END, 
        amount_change, 
        description, 
        'completed'
    );

    RETURN json_build_object('success', true, 'new_balance', new_balance);
END;
$$ LANGUAGE plpgsql;

-- 3. Function Set Myself Admin (Helper)
CREATE OR REPLACE FUNCTION set_myself_admin()
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (auth.uid(), 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN 'You are now an admin';
END;
$$ LANGUAGE plpgsql;
