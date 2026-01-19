-- =============================================
-- Migration: Storage Setup for Apps
-- =============================================

-- 1. Create Buckets
-- 'app-assets': For icons, cover images (Publicly accessible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 'app-builds': For installers (exe, zip) (Publicly accessible for direct download links)
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-builds', 'app-builds', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Note: Supabase Storage RLS is separate from Table RLS.

-- Policy: Allow ADMIN to do EVERYTHING (Upload, Delete, Update) on ALL buckets
-- We check against the public.user_roles table.
CREATE POLICY "Admin Full Access Storage" ON storage.objects
FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policy: Allow EVERYONE (Public) to READ (Select) from 'app-assets'
CREATE POLICY "Public Read Assets" ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'app-assets' );

-- Policy: Allow EVERYONE (Public) to READ (Select) from 'app-builds'
-- If you want to restrict downloads to logged-in users only, change TO public -> TO authenticated
CREATE POLICY "Public Read Builds" ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'app-builds' );
