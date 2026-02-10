
-- Create storage bucket for webbook media files
INSERT INTO storage.buckets (id, name, public) VALUES ('webbook-media', 'webbook-media', true);

-- Allow anyone to read files (public bucket)
CREATE POLICY "Public read access for webbook media"
ON storage.objects FOR SELECT
USING (bucket_id = 'webbook-media');

-- Allow anyone to upload files (no auth required for this tool)
CREATE POLICY "Public upload access for webbook media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'webbook-media');

-- Allow anyone to delete their files
CREATE POLICY "Public delete access for webbook media"
ON storage.objects FOR DELETE
USING (bucket_id = 'webbook-media');
