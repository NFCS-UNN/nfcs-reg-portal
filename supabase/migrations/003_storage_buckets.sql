-- Migration 003: Storage Buckets
-- Run in Supabase SQL Editor

-- Passport photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'passport-photos',
  'passport-photos',
  FALSE,                          -- Private: requires signed URL
  2097152,                        -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT DO NOTHING;

-- Documents bucket (for CSV imports, receipts, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'documents',
  'documents',
  FALSE,
  10485760                        -- 10MB
) ON CONFLICT DO NOTHING;

-- Storage RLS (Requires enabling RLS on storage.objects if not already enabled)
-- Ensure bucket policy actions can be run by authenticated users or excos

DROP POLICY IF EXISTS "users_upload_own_photo" ON storage.objects;
DROP POLICY IF EXISTS "users_read_own_photo" ON storage.objects;
DROP POLICY IF EXISTS "exco_manage_documents" ON storage.objects;

CREATE POLICY "users_upload_own_photo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'passport-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_read_own_photo"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'passport-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('exco', 'super_admin')
    )
  );

CREATE POLICY "exco_manage_documents"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'documents' 
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('exco', 'super_admin')
  );
