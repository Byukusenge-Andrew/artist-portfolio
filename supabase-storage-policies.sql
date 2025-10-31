-- ==================================================
-- SUPABASE STORAGE POLICIES SETUP
-- Project: james
-- Buckets: artworks, avatars
-- ==================================================

-- 🔍 STEP 1: Check Current Bucket Configuration
-- Run this first to see your current setup
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at,
    updated_at
FROM storage.buckets 
WHERE name IN ('artworks', 'avatars');

-- 🛠️ STEP 2: Configure Bucket Settings
-- Update artworks bucket for artwork uploads (50MB limit)
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY[
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp',
        'image/svg+xml'
    ]
WHERE name = 'artworks';

-- Update avatars bucket for profile images (10MB limit)
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 10485760, -- 10MB
    allowed_mime_types = ARRAY[
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif', 
        'image/webp'
    ]
WHERE name = 'avatars';

-- 🗑️ STEP 3: Clean Up Existing Policies (Optional)
-- Remove any conflicting policies first
DROP POLICY IF EXISTS "Allow authenticated uploads to artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own artworks" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own avatar" ON storage.objects;

-- 🔐 STEP 4: Create Storage Policies

-- ==================================================
-- ARTWORKS BUCKET POLICIES
-- ==================================================

-- Allow authenticated users to upload artwork files
CREATE POLICY "artworks_upload_policy" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'artworks'
);

-- Allow everyone to read/view artwork files (public access)
CREATE POLICY "artworks_read_policy" ON storage.objects
FOR SELECT 
TO public
USING (
    bucket_id = 'artworks'
);

-- Allow authenticated users to update artwork files
CREATE POLICY "artworks_update_policy" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'artworks'
)
WITH CHECK (
    bucket_id = 'artworks'
);

-- Allow authenticated users to delete artwork files
CREATE POLICY "artworks_delete_policy" ON storage.objects
FOR DELETE 
TO authenticated
USING (
    bucket_id = 'artworks'
);

-- ==================================================
-- AVATARS BUCKET POLICIES
-- ==================================================

-- Allow authenticated users to upload avatar files
CREATE POLICY "avatars_upload_policy" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
);

-- Allow everyone to read/view avatar files (public access)
CREATE POLICY "avatars_read_policy" ON storage.objects
FOR SELECT 
TO public
USING (
    bucket_id = 'avatars'
);

-- Allow authenticated users to update avatar files
CREATE POLICY "avatars_update_policy" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'avatars'
)
WITH CHECK (
    bucket_id = 'avatars'
);

-- Allow authenticated users to delete avatar files
CREATE POLICY "avatars_delete_policy" ON storage.objects
FOR DELETE 
TO authenticated
USING (
    bucket_id = 'avatars'
);

-- 🔒 STEP 5: Enable Row Level Security (RLS)
-- Ensure RLS is enabled on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 🎯 STEP 6: Grant Necessary Permissions
-- Grant permissions to authenticated users and service role
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.buckets TO service_role;

-- ✅ STEP 7: Verify Setup
-- Run this to confirm everything is working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- 📋 STEP 8: Test Bucket Access
-- Check if buckets are properly configured
SELECT 
    b.name as bucket_name,
    b.public,
    b.file_size_limit / 1024 / 1024 as size_limit_mb,
    b.allowed_mime_types,
    COUNT(o.id) as file_count
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.name = o.bucket_id
WHERE b.name IN ('artworks', 'avatars')
GROUP BY b.name, b.public, b.file_size_limit, b.allowed_mime_types
ORDER BY b.name;

-- ==================================================
-- 🚀 COMPLETION NOTES
-- ==================================================
-- 
-- After running this script:
-- 
-- 1. ✅ Artworks bucket: 50MB limit, public read, auth upload/update/delete
-- 2. ✅ Avatars bucket: 10MB limit, public read, auth upload/update/delete
-- 3. ✅ All policies are properly named and organized
-- 4. ✅ RLS is enabled for security
-- 5. ✅ Proper permissions are granted
-- 
-- Your app can now:
-- - Upload artwork files to 'artworks' bucket
-- - Upload profile images to 'avatars' bucket  
-- - Anyone can view the files (public read)
-- - Only authenticated users can upload/modify files
-- 
-- Test your setup by uploading a file through your app!
-- ==================================================