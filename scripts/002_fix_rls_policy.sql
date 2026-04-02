-- Fix RLS policies for authenticated users to properly read data
-- The previous policy used auth.role() which doesn't work correctly
-- This uses auth.uid() IS NOT NULL to check for authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view" ON public.tamu;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.tamu;

-- Recreate policy: Allow authenticated users (admin) to view all records
CREATE POLICY "Allow authenticated users to view" ON public.tamu
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Recreate policy: Allow authenticated users (admin) to delete records
CREATE POLICY "Allow authenticated users to delete" ON public.tamu
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
