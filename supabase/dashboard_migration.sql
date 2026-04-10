-- Migration: Create Dashboard Tables
-- Thêm các bảng cần thiết cho Dashboard (ví, giao dịch, bản quyền)

-- Bảng user_wallets quản lý số dư của người dùng
CREATE TABLE IF NOT EXISTS public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for user_wallets
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet" 
    ON public.user_wallets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and update all wallets" 
    ON public.user_wallets FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Trigger to automatically create a wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_wallets (user_id, balance)
    VALUES (NEW.id, 0.00);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn trigger vào bảng auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();


-- Bảng transactions quản lý lịch sử giao dịch nạp tiền/mua hàng
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('deposit', 'purchase', 'refund', 'bonus')),
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" 
    ON public.transactions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
    ON public.transactions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- Bảng licenses quản lý bản quyền phần mềm đã mua
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app_id VARCHAR(255) NOT NULL, -- Tham chiếu tới apps.id hoặc apps.slug tùy kiến trúc (có thể không khoá ngoại nếu app là static/markdown)
    license_key VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS for licenses
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licenses" 
    ON public.licenses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all licenses" 
    ON public.licenses FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
