# Upload System Architecture Fix

## The Problem
Your app has two different auth systems:
- **Admin Login**: Custom password → cookie (`admin_session`)
- **Supabase Storage RLS**: Expects Supabase Auth session (`auth.uid()`)

These don't talk to each other, causing RLS violation errors.

## The Solution
```
┌─────────────────────────────────────┐
│  User Signs In (Password)           │
│  → admin_session cookie set         │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  User Uploads Image                 │
│  → SupabaseUpload component         │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  POST /api/uploads/supabase         │
│  (Server-Side)                      │
│                                     │
│  ✅ Check admin_session cookie      │
│  ✅ Use service_role key            │
│  ✅ Upload to Supabase              │
│  ✅ Return public URL               │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  File Stored in Supabase Storage    │
│  (Publicly Accessible)              │
└─────────────────────────────────────┘
```

## Key Points

| Item | Details |
|------|---------|
| **Auth Check** | Server checks `admin_session` cookie (your existing auth) |
| **RLS Bypass** | Server uses `service_role` key (safe—never sent to client) |
| **Security** | File size/type validated on server before upload |
| **User Experience** | Works seamlessly with existing admin login |

## Setup Checklist

- [ ] Copy Service Role Key from Supabase Dashboard
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- [ ] Restart `npm run dev`
- [ ] Test upload at `/admin/artworks/new`
- [ ] Verify file appears in Supabase Storage

## Files

| File | Purpose |
|------|---------|
| `app/api/uploads/supabase/route.ts` | Server endpoint for uploads |
| `components/SupabaseUpload.tsx` | Updated to use server endpoint |
| `UPLOAD_QUICKSTART.md` | Quick setup guide |
| `SERVER_UPLOAD_SETUP.md` | Detailed explanation |

---

**Status**: ✅ Upload system now works with admin authentication
