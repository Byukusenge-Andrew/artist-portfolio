# 🚀 Upload Fix - Quick Start

## ✅ What's Fixed

Your custom admin auth now works with Supabase storage uploads via a server-side endpoint.

---

## 📋 One-Time Setup

### Step 1: Get Your Service Role Key
1. Go to Supabase Dashboard → https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the **Service Role Key** (the long secret key)

### Step 2: Add to `.env.local`
Add this line to `d:\James\artist-portfolio\.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Replace `your_service_role_key_here` with the actual key.

### Step 3: Restart Development Server
```powershell
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✨ Test It

1. **Navigate** to http://localhost:3000/admin/login
2. **Enter password** (your admin password)
3. **Sign in**
4. **Go to** http://localhost:3000/admin/artworks/new
5. **Click Upload**
6. **Select an image** and upload

**Expected result**: ✅ File uploads and appears in Supabase Storage

---

## 🔍 Verify Success

### In Browser
- Upload completes without error
- Status shows "Upload successful!"
- No console errors

### In Supabase Dashboard
1. Go to Storage → artworks bucket
2. Should see your uploaded file with timestamp name
3. Example: `1761894924923-i4fuyruh6n.png`

---

## 🆘 If It Fails

### Error: "Unauthorized. Please sign in first."
- Sign out and sign back in
- Check browser cookies for `admin_session`

### Error: "File too large" or "Invalid file type"
- Use a JPEG, PNG, GIF, or WebP image
- File must be under 50MB

### Error: "Upload timeout"
- Try a smaller file
- Check internet connection
- Check Supabase service status

### No errors but file doesn't appear
- Restart `npm run dev`
- Check `.env.local` has correct service role key
- Check Supabase project is correct

---

## 📁 Files Created/Updated

- ✅ Created: `app/api/uploads/supabase/route.ts` (server endpoint)
- ✅ Updated: `components/SupabaseUpload.tsx` (uses server endpoint)
- ✅ Updated: `SERVER_UPLOAD_SETUP.md` (detailed guide)

---

## 🎯 Done!

Uploads now work with your admin login. You're all set! 🎉
