-- Limit product image uploads to protect Supabase Storage usage.
-- The admin UI compresses product images to 900KB before upload; this bucket
-- limit leaves a small safety margin and blocks oversized direct uploads.

update storage.buckets
set
  file_size_limit = 1048576,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'product-images';
