-- 004: Create signatures storage bucket for tenant signature images
INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow service_role to upload signature images
CREATE POLICY "Service role can upload signature images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures' AND auth.role() = 'service_role');

-- Allow public read access to signature images
CREATE POLICY "Public read access to signature images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures');
