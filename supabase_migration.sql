-- MIGRATION SCRIPT CHO WEB-DTA (SUPABASE)
-- Mục đích: Khởi tạo các bảng Database thực tế để thay thế Mock Data
-- Hướng dẫn: Copy toàn bộ đoạn code này và dán vào phần SQL Editor trên Supabase Dashboard, sau đó nhấn RUN.

-- ==========================================
-- 1. TẠO BẢNG USER_WALLETS (Quản lý ví tiền)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance BIGINT DEFAULT 0 NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Người dùng chỉ được xem ví của chính mình
DROP POLICY IF EXISTS "Users can view own wallet" ON public.user_wallets;
CREATE POLICY "Users can view own wallet" 
ON public.user_wallets FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Chỉ Admin (Service Role) mới được cập nhật số dư qua server an toàn
DROP POLICY IF EXISTS "Service role can update wallets" ON public.user_wallets;
CREATE POLICY "Service role can update wallets" 
ON public.user_wallets FOR UPDATE 
USING (true);


-- ==========================================
-- 2. TẠO BẢNG TRANSACTIONS (Quản lý giao dịch)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase')),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Người dùng chỉ được xem giao dịch của chính mình
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Người dùng có thể tạo giao dịch mới (Ví dụ: Yêu cầu nạp tiền)
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- 3. TẠO BẢNG LICENSES (Quản lý bản quyền/sản phẩm)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app_id VARCHAR(100) NOT NULL,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL nghĩa là vĩnh viễn (Lifetime)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Policy: Người dùng chỉ được xem các license của chính mình
DROP POLICY IF EXISTS "Users can view own licenses" ON public.licenses;
CREATE POLICY "Users can view own licenses" 
ON public.licenses FOR SELECT 
USING (auth.uid() = user_id);


-- ==========================================
-- 4. TẠO DATABASE TRIGGERS & FUNCTIONS
-- ==========================================

-- Function tự động cập nhật trường updated_at cho user_wallets
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn Trigger vào user_wallets
DROP TRIGGER IF EXISTS on_wallet_updated ON public.user_wallets;
CREATE TRIGGER on_wallet_updated
    BEFORE UPDATE ON public.user_wallets
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Function tự động tạo user_wallet với số dư 0 ngay khi có user mới đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn Trigger vào bảng auth.users của Supabase
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user_wallet();

-- Dành cho các tài khoản auth.users ĐÃ TỒN TẠI TRƯỚC ĐÓ nhưng chưa có ví
INSERT INTO public.user_wallets (user_id, balance)
SELECT id, 0 FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_wallets);
