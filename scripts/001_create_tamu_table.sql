-- Create tamu (guest) table for buku tamu digital
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

-- Policy: Allow anyone to insert (for guest form - public access)
CREATE POLICY "Allow public insert" ON public.tamu
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users (admin) to view all records
CREATE POLICY "Allow authenticated users to view" ON public.tamu
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users (admin) to delete records
CREATE POLICY "Allow authenticated users to delete" ON public.tamu
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tamu_waktu_kunjungan ON public.tamu(waktu_kunjungan DESC);
CREATE INDEX IF NOT EXISTS idx_tamu_tujuan ON public.tamu(tujuan);
