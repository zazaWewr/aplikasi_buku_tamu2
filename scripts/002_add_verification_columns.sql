-- Add verification system columns to tamu table
ALTER TABLE public.tamu
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS status_verifikasi TEXT DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_tamu_status_verifikasi ON public.tamu(status_verifikasi);

-- Update RLS policies to allow authenticated users to update status
CREATE POLICY "Allow authenticated users to update status" ON public.tamu
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
