-- =============================================
-- Migration: Add Media & Guide columns to Apps table
-- =============================================

ALTER TABLE public.apps
ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS guide TEXT; -- Markdown content

COMMENT ON COLUMN public.apps.screenshots IS 'Array of screenshot URLs';
COMMENT ON COLUMN public.apps.video_url IS 'YouTube video URL for tutorial/intro';
COMMENT ON COLUMN public.apps.guide IS 'Markdown content for installation/usage guide';
