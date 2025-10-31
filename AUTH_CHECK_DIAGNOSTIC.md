# RLS Upload Error - Diagnostic & Fix

**Error**: `StorageApiError: new row violates row-level security policy`

---

## ✅ What Was Fixed

### 1. Updated `SupabaseUpload.tsx`
Added **authentication check BEFORE upload**:

```typescript
// 🔐 Check if user is authenticated FIRST
const { data: { session } } = await supabase.auth.getSession();
if (!session?.user?.id) {
  throw new Error("You must be logged in to upload files. Please sign in and try again.");
}
```

**Why this matters**: The RLS policy requires an authenticated user. If the session is missing or invalid, Supabase rejects the INSERT with "violates row-level security policy".

### 2. Updated `supabase-storage-policies.sql`
Added explicit auth checks to INSERT policies:

```sql
CREATE POLICY "artworks_upload_policy" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'artworks'
    AND auth.uid() IS NOT NULL  -- ✅ Critical check
);
```

---

## 🧪 Test Now

### Step 1: Apply SQL Policies (if not done)
1. Supabase Dashboard → SQL Editor
2. Copy & paste `supabase-storage-policies.sql`
3. Click Run

### Step 2: Test Upload
1. **Sign in** to your app (e.g., go to `/admin/login`)
2. **Go to** `/admin/artworks/new`
3. **Try uploading an image**

**Expected**:
- Status shows: "Checking authentication..." → "Uploading to Supabase..." → "Upload successful!"
- Image appears in Supabase Storage dashboard
- No RLS error ✅

---

## 🐛 Troubleshooting

### If you still get "violates row-level security" error:

**Option 1: Verify authentication in browser console**
```javascript
// Paste into DevTools console (F12)
const { data: { session } } = await supabase.auth.getSession();
console.log("Session User ID:", session?.user?.id);
console.log("Auth Token:", session?.access_token ? "✅ Present" : "❌ Missing");
console.log("Is Authenticated:", !!session?.user);
```

Expected output:
- `Session User ID` → UUID (not null, not "anon")
- `Auth Token` → "✅ Present"
- `Is Authenticated` → true

**If any are missing/false**: User is NOT logged in → sign out and sign back in

---

**Option 2: Verify policies exist in Supabase**
```sql
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE schemaname='storage' AND tablename='objects'
AND policyname LIKE '%upload%'
ORDER BY policyname;
```

Expected: 2 rows
- `artworks_upload_policy` → roles: `{authenticated}`
- `avatars_upload_policy` → roles: `{authenticated}`

If missing → re-run `supabase-storage-policies.sql`

---

**Option 3: Check environment variables**

Verify `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://oailqxrteoswjnlprsrn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-here>
```

- Do NOT use `SERVICE_ROLE_KEY` in client code
- Both keys should be non-empty strings

---

**Option 4: Check bucket settings**
```sql
SELECT name, public, file_size_limit
FROM storage.buckets 
WHERE name IN ('artworks', 'avatars');
```

Expected:
- `public` = true (both buckets)
- `file_size_limit` > 0 (both buckets)

---

## 📋 Upload Flow Now

```
User clicks Upload
    ↓
Auth check: supabase.auth.getSession()
    ↓
Is user logged in? (session.user.id exists?)
    ├─ NO → Show error: "You must be logged in..."
    └─ YES ↓
      Supabase storage.from('artworks').upload()
        ↓
      RLS policy checks:
        - bucket_id = 'artworks'? ✅
        - TO authenticated? ✅
        - auth.uid() IS NOT NULL? ✅
        ↓
      INSERT succeeds ✅ → Upload complete
```

---

## 🚀 After Upload Works

1. **Verify file stored**: Check Supabase Storage dashboard → artworks bucket
2. **Verify file accessible**: Try opening the URL in a new tab
3. **Verify owner recorded**: In Supabase SQL:
```sql
SELECT id, name, owner, path, created_at
FROM storage.objects
WHERE bucket_id = 'artworks'
ORDER BY created_at DESC
LIMIT 5;
```

Should show your uploaded files with `owner` = your user ID (UUID).

---

## 📞 Still Stuck?

1. **Check console errors** → Copy exact error message
2. **Run all verification queries** above
3. **Restart the Next.js dev server** → `npm run dev`
4. **Clear browser cache** → Hard refresh (Ctrl+Shift+R)
5. **Re-apply SQL policies** → Full script fresh run

---

**Status**: Authentication check added to upload component + RLS policies configured 🎯
