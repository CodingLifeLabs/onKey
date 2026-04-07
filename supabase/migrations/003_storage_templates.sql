-- 003: Create templates storage bucket for image uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload template images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'templates' AND auth.role() = 'authenticated');

-- Allow public read access to template images
CREATE POLICY "Public read access to template images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'templates');
