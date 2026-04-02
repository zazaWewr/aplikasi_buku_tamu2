-- Fix RLS policies for authenticated users to properly read data
-- The previous policy used auth.role() which doesn't work correctly
-- This uses auth.uid() IS NOT NULL to check for authenticated users

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS public.tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  instansi TEXT,
  no_hp TEXT NOT NULL,
  tujuan TEXT NOT NULL,
  keperluan TEXT NOT NULL,
  waktu_kunjungan TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.tamu ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Allow authenticated users to view" ON public.tamu;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON public.tamu;
DROP POLICY IF EXISTS "Allow public insert" ON public.tamu;
DROP POLICY IF EXISTS "Allow anyone to insert" ON public.tamu;

-- Policy: Allow anyone to insert (for guest form - public access)
CREATE POLICY "Allow public insert" ON public.tamu
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users (admin) to view all records
CREATE POLICY "Allow authenticated users to view" ON public.tamu
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Allow authenticated users (admin) to delete records
CREATE POLICY "Allow authenticated users to delete" ON public.tamu
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tamu_waktu_kunjungan ON public.tamu(waktu_kunjungan DESC);
CREATE INDEX IF NOT EXISTS idx_tamu_tujuan ON public.tamu(tujuan);
CREATE INDEX IF NOT EXISTS idx_tamu_created_at ON public.tamu(created_at DESC);
