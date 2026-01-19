-- =============================================
-- Migration: Fix RLS for Apps table (Allow Admins)
-- =============================================

-- 1. Drop old restrictive policies (which were set to false)
DROP POLICY IF EXISTS "Only admins can insert apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can update apps" ON public.apps;
DROP POLICY IF EXISTS "Only admins can delete apps" ON public.apps;

-- 2. Create new policies using the is_admin() function
CREATE POLICY "Admins can insert apps" ON public.apps
FOR INSERT 
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update apps" ON public.apps
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete apps" ON public.apps
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 3. Ensure current user is admin (optional helper)
-- Run this if you are the owner but not yet in user_roles
-- SELECT public.set_myself_admin();
