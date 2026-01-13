-- Create enum for app platform
CREATE TYPE public.app_platform AS ENUM ('web', 'desktop');

-- Create apps table for storing product information
CREATE TABLE public.apps (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_vi TEXT NOT NULL,
    description TEXT NOT NULL,
    description_vi TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Monitor',
    platform app_platform NOT NULL DEFAULT 'desktop',
    categories TEXT[] NOT NULL DEFAULT '{}',
    url TEXT DEFAULT '#',
    github_url TEXT,
    download_url TEXT,
    image_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Public can read active apps
CREATE POLICY "Anyone can view active apps" 
ON public.apps 
FOR SELECT 
USING (is_active = true);

-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all apps
CREATE POLICY "Admins can insert apps"
ON public.apps
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update apps"
ON public.apps
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete apps"
ON public.apps
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_apps_updated_at
BEFORE UPDATE ON public.apps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on auth.users for auto-profile creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert default apps data
INSERT INTO public.apps (id, title, title_vi, description, description_vi, icon_name, platform, categories, url, featured) VALUES
('auto-clicker', 'DTA Auto Clicker', 'DTA Tự Động Click', 'Advanced auto-clicking tool with customizable intervals, hotkeys, and multi-target support.', 'Công cụ tự động click nâng cao với tùy chỉnh khoảng cách, phím tắt và hỗ trợ đa mục tiêu.', 'MousePointer2', 'desktop', ARRAY['desktop', 'automation'], '#', true),
('gemini-vision', 'Gemini Vision Tool', 'Công Cụ Gemini Vision', 'AI-powered image analysis and description generator using Google Gemini API.', 'Phân tích hình ảnh và tạo mô tả bằng AI sử dụng Google Gemini API.', 'Eye', 'web', ARRAY['web', 'automation'], '#', true),
('short-generator', 'DTA Short Generator', 'DTA Tạo Video Ngắn', 'Automatically generate short-form videos from long content with AI editing.', 'Tự động tạo video ngắn từ nội dung dài với chỉnh sửa AI.', 'Video', 'desktop', ARRAY['desktop', 'automation'], '#', false),
('code-formatter', 'Universal Code Formatter', 'Định Dạng Code Đa Năng', 'Format and beautify code in 20+ programming languages instantly.', 'Định dạng và làm đẹp code cho hơn 20 ngôn ngữ lập trình.', 'FileCode', 'web', ARRAY['web'], '#', false),
('task-automator', 'DTA Task Automator', 'DTA Tự Động Hóa Tác Vụ', 'Create complex automation workflows with visual drag-and-drop interface.', 'Tạo quy trình tự động phức tạp với giao diện kéo thả trực quan.', 'Sparkles', 'desktop', ARRAY['desktop', 'automation'], '#', true);