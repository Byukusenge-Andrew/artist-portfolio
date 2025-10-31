# Supabase RLS Upload Error - Fix Checklist

**Error**: `StorageApiError: new row violates row-level security policy`

---

## 📋 The Problem
Your current upload policies don't explicitly allow authenticated users to INSERT. RLS blocks the upload because no policy permits the INSERT action.

---

## ✅ Step 1: Apply Fixed Policies (Supabase Dashboard)

1. Open your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the **entire** contents of `supabase-storage-policies.sql` from your workspace
5. Paste into the query box
6. Click **Run** ▶️

> **Note**: VS Code shows SQL Server linting errors, but the PostgreSQL syntax is correct for Supabase. Ignore those errors.

---

## 🔍 Step 2: Verify Policies Were Created

After Step 1 succeeds, run this verification query in SQL Editor:

```sql
SELECT 
    policyname,
    schemaname,
    tablename,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname='storage' AND tablename='objects'
ORDER BY policyname;
```

**Expected output**: You should see 6 policies:
- `artworks_delete_policy`
- `artworks_read_policy`
- `artworks_update_policy`
- `artworks_upload_policy` ← **This one was likely missing**
- `avatars_delete_policy`
- `avatars_read_policy`
- `avatars_update_policy`
- `avatars_upload_policy` ← **This one was likely missing**

---

## 🔐 Step 3: Check User Authentication (Browser Console)

Before testing upload, confirm the user is logged in:

```javascript
// Paste into browser console (F12 → Console tab)
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
console.log('Is authenticated:', !!session?.access_token);
```

**Expected output**:
- `Session` → should NOT be null
- `User ID` → should be a valid UUID (not null)
- `Is authenticated` → should be `true`

If any are missing, user is not logged in → **upload will fail**.

---

## 📤 Step 4: Test Upload

1. Go to your app (e.g., `/admin/artworks/new`)
2. Select an image and click Upload
3. Check for success or error in console

**If upload succeeds** ✅:
- File appears in storage browser
- You'll see the URL in console

**If upload fails** ❌:
- Check console error message
- Proceed to **Troubleshooting** below

---

## 🐛 Troubleshooting

### Still getting "violates row-level security policy"?

**Option A: Check if user is actually authenticated**
```javascript
// In browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Auth role:', user?.role || 'NO USER');  // Should NOT be 'anon'
```

If role is `anon`, user is NOT logged in:
- ✅ Try logging out and logging back in
- ✅ Check `lib/supabaseClient.ts` — ensure it's using `annonKey`, not `serviceRoleKey`

**Option B: Re-apply the SQL policies (fresh start)**
1. Go to **SQL Editor** in Supabase
2. Run this cleanup:
```sql
DROP POLICY IF EXISTS "artworks_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "artworks_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "artworks_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "artworks_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_policy" ON storage.objects;
```
3. Then re-run the full `supabase-storage-policies.sql` script

**Option C: Check your Supabase environment variables**
- Verify `.env.local` has correct keys:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://oailqxrteoswjnlprsrn.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
  ```
- Do NOT use `SERVICE_ROLE_KEY` in client-side code

**Option D: Check bucket settings**
```sql
SELECT name, public, file_size_limit FROM storage.buckets 
WHERE name IN ('artworks', 'avatars');
```
- `public` should be `true`
- `file_size_limit` should be > 0

---

## 📝 What Changed in the Fixed Policy

**Before** (RLS error):
```sql
CREATE POLICY "artworks_upload_policy" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'artworks'
);  -- ❌ Missing auth.uid() check
```

**After** (works):
```sql
CREATE POLICY "artworks_upload_policy" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'artworks'
    AND auth.uid() IS NOT NULL  -- ✅ Explicit auth check
);
```

This explicitly tells Supabase: "Allow INSERT for authenticated users **only if** the user has a valid auth.uid()".

---

## 🎯 Next Steps After Upload Works

Once uploads succeed:
1. Test in both `artworks` and `avatars` buckets
2. Verify files are public-readable by opening the URL in a new tab
3. Check Supabase Storage dashboard to see uploaded files

---

## 📞 Need Help?

- **Supabase Storage Docs**: https://supabase.com/docs/guides/storage
- **RLS Debugging**: https://supabase.com/docs/guides/storage/security/access-control
- **Auth Check**: https://supabase.com/docs/guides/auth/sessions

---

**Project**: james  
**Status**: RLS policies updated and ready to test 🚀
