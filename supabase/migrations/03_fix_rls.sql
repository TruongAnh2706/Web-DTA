-- =============================================
-- Migration: Fix Infinite Recursion in RLS (FINAL)
-- =============================================

-- 1. Create a secure function to check admin role (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
SECURITY DEFINER -- Runs with owner privileges
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Drop the old problematic policy
DROP POLICY IF EXISTS "Admins can full access" ON public.user_roles;

-- 3. Create the new non-recursive policy using the function
CREATE POLICY "Admins can full access" ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Grant execution permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 5. Ensure "Users can read own role" policy exists (from previous fix)
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Users can read own role" ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
