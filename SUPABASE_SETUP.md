# Supabase Storage Setup Guide

## 📁 Files Created
- `supabase-storage-policies.sql` - Complete SQL script for your storage configuration

## 🚀 How to Apply These Policies

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase-storage-policies.sql`
5. Click **Run** to execute all commands

### Option 2: Supabase CLI
```bash
# Make sure you're connected to your project
supabase db push

# Or apply the SQL file directly
supabase db reset --sql-file supabase-storage-policies.sql
```

## 📋 What This Script Does

### Bucket Configuration
- **artworks bucket**: 50MB file limit, supports all major image formats
- **avatars bucket**: 10MB file limit, optimized for profile images

### Security Policies
- ✅ Public read access (anyone can view images)
- ✅ Authenticated upload (only logged-in users can upload)
- ✅ Authenticated update/delete (only logged-in users can modify)
- ✅ Row Level Security enabled

### File Type Support
- **Artworks**: JPEG, PNG, GIF, WebP, SVG
- **Avatars**: JPEG, PNG, GIF, WebP (no SVG for security)

## 🔧 After Setup

### Update Your Upload Components
Make sure your `components/SupabaseUpload.tsx` uses the correct bucket names:

```typescript
// For artwork uploads
const { data, error } = await supabase.storage
  .from('artworks')  // ✅ Correct bucket name
  .upload(fileName, file);

// For avatar uploads  
const { data, error } = await supabase.storage
  .from('avatars')   // ✅ Correct bucket name
  .upload(fileName, file);
```

### Test Your Setup
1. Try uploading an artwork through your app
2. Check if the file appears in the Supabase storage dashboard
3. Verify the file is publicly accessible via URL

## 🔍 Troubleshooting

### If uploads fail:
1. Check the browser console for errors
2. Verify your Supabase URL and anon key in `.env.local`
3. Make sure the user is authenticated when uploading

### If policies don't work:
1. Re-run the verification queries in the SQL file
2. Check the Supabase logs in the dashboard
3. Ensure RLS is enabled on storage.objects

## 📞 Need Help?
- Check Supabase docs: https://supabase.com/docs/guides/storage
- Review storage policies: https://supabase.com/docs/guides/storage/security/access-control

---
**Project**: james  
**Buckets**: artworks, avatars  
**Status**: Ready to deploy 🚀