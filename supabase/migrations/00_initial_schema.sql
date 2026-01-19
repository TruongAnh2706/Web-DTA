-- =============================================
-- Migration: Tạo các bảng cơ bản cho DTA Studio Hub
-- =============================================

-- 1. Bảng APPS - Lưu thông tin các ứng dụng
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_vi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Monitor',
    platform TEXT NOT NULL CHECK (platform IN ('web', 'desktop')),
    categories TEXT[] NOT NULL DEFAULT '{}',
    url TEXT,
    github_url TEXT,
    download_url TEXT,
    image_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    required_subscription TEXT NOT NULL DEFAULT 'Free' CHECK (required_subscription IN ('Free', 'VIP1', 'VIP2')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Bảng USER_ROLES - Quản lý quyền admin
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 3. Bảng USER_WALLETS - Quản lý số dư ví người dùng
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Bảng TRANSACTIONS - Lịch sử giao dịch
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'refund')),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Bảng LICENSES - Quản lý license key
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    license_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'banned')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes để tăng hiệu suất
-- =============================================
CREATE INDEX IF NOT EXISTS idx_apps_platform ON apps(platform);
CREATE INDEX IF NOT EXISTS idx_apps_featured ON apps(featured);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);

-- =============================================
-- RLS (Row Level Security) Policies
-- =============================================

-- Apps: Cho phép mọi người đọc
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apps are viewable by everyone" ON apps FOR SELECT USING (true);
CREATE POLICY "Only admins can insert apps" ON apps FOR INSERT WITH CHECK (false); -- Update via admin panel
CREATE POLICY "Only admins can update apps" ON apps FOR UPDATE USING (false);
CREATE POLICY "Only admins can delete apps" ON apps FOR DELETE USING (false);

-- User Roles: Chỉ user mới xem được role của chính mình
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- User Wallets: Chỉ user mới xem được ví của chính mình
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wallet" ON user_wallets FOR SELECT USING (auth.uid() = user_id);

-- Transactions: Chỉ user mới xem được giao dịch của chính mình
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Licenses: Chỉ user mới xem được license của chính mình
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own licenses" ON licenses FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- Trigger tự động cập nhật updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_apps_updated_at BEFORE UPDATE ON apps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_wallets_updated_at BEFORE UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Dữ liệu demo cho bảng APPS
-- =============================================
INSERT INTO apps (title, title_vi, description, description_vi, icon_name, platform, categories, github_url, download_url, featured, required_subscription)
VALUES 
('DTA Auto Clicker', 'Auto Clicker DTA', 'Powerful auto clicker for automation tasks', 'Công cụ tự động click mạnh mẽ cho các tác vụ tự động hóa', 'MousePointer2', 'desktop', ARRAY['automation'], 'https://github.com/yourusername/auto-clicker', '#', true, 'Free'),
('DTA Screen Recorder', 'Ghi Màn Hình DTA', 'Professional screen recording tool', 'Công cụ ghi màn hình chuyên nghiệp', 'Video', 'desktop', ARRAY['desktop'], NULL, '#', true, 'VIP1'),
('DTA Code Editor', 'Trình Soạn Code DTA', 'Lightweight code editor with syntax highlighting', 'Trình soạn thảo code nhẹ với tô sáng cú pháp', 'FileCode', 'desktop', ARRAY['desktop'], NULL, '#', false, 'Free');

COMMENT ON TABLE apps IS 'Lưu trữ thông tin các ứng dụng/công cụ';
COMMENT ON TABLE user_roles IS 'Quản lý quyền hạn người dùng (admin/user)';
COMMENT ON TABLE user_wallets IS 'Quản lý số dư ví của người dùng';
COMMENT ON TABLE transactions IS 'Lịch sử giao dịch nạp tiền/mua hàng';
COMMENT ON TABLE licenses IS 'Quản lý license key của người dùng';
