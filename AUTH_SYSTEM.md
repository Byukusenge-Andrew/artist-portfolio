# Authentication & Authorization System

## Overview

The application now features a comprehensive authentication system with role-based access control supporting two user types:
- **Regular Users** - Browse, purchase, and save favorites
- **Admin Users** - Manage artworks, galleries, orders, and site content

## File Structure

### Core Authentication Files

- `/lib/auth.ts` - Authentication utilities (password hashing, session management)
- `/contexts/AuthContext.tsx` - React context for client-side auth state management
- `/middleware.ts` - Route protection and role-based redirects
- `/app/api/auth/` - Authentication API endpoints

### User Pages

- `/app/user/dashboard` - Main user dashboard with quick links
- `/app/user/orders` - Order history and status
- `/app/user/favorites` - Saved favorite artworks
- `/app/user/profile` - Profile settings and account management

### Admin Pages

- `/app/admin/dashboard` - Admin overview with statistics
- `/app/admin/login` - Admin login (requires ADMIN role)
- Existing admin features now require ADMIN role

### Auth Pages

- `/app/auth/register` - User registration page
- `/app/auth/login` - User login page

## User Roles

### USER Role
Access to:
- Public galleries and artworks
- User dashboard and profile
- Order history and management
- Save favorites
- Shopping checkout

### ADMIN Role
Access to:
- All user features
- Admin dashboard with analytics
- Artwork management (/admin/artworks/new)
- Gallery management
- Order management and viewing
- Artist profile management
- Commission requests

## Session Management

### Session Format

User sessions are stored in an **httpOnly cookie** named `user_session`:

```typescript
// Encoded as Base64 JSON
{
  "id": "user_id_uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER" | "ADMIN",
  "isActive": true
}
```

### Session Security

- **httpOnly**: Cannot be accessed via JavaScript (prevents XSS attacks)
- **sameSite=lax**: CSRF protection
- **maxAge=604800**: 7-day expiration
- **Secure flag**: Transmitted only over HTTPS in production

### Password Security

- Hashed using **SHA-256** algorithm
- Passwords are never stored in plain text
- Future upgrade to bcrypt recommended

## API Endpoints

### `/api/auth/register` - POST
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "name": "User Name"
}
```

**Validation:**
- Email must be unique
- Password must be 8+ characters
- Passwords must match
- Name is required

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER"
}
```

### `/api/auth/login` - POST
Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation:**
- User must exist
- User must be active (isActive = true)
- Password must match

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER"
}
```

### `/api/auth/logout` - POST
Sign out and clear session.

**Response:**
```json
{ "success": true }
```

### `/api/auth/session` - GET
Get current user session information.

**Response (if authenticated):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER",
    "isActive": true
  }
}
```

**Response (if not authenticated):**
```json
{
  "user": null
}
```

## Using Authentication in Components

### Client Components

Use the `useAuth()` hook to access auth state:

```typescript
"use client";
import { useAuth } from "@/contexts/AuthContext";

export default function MyComponent() {
  const { user, loading, isAdmin, isUser, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      {isAdmin && <p>You are an admin</p>}
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Server Components

Decode session from cookies:

```typescript
import { cookies } from "next/headers";

async function MyServerComponent() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;

  if (!userSession) {
    redirect("/auth/login");
  }

  const user = JSON.parse(
    Buffer.from(userSession, "base64").toString()
  );

  return <div>Welcome, {user.name}</div>;
}
```

## Route Protection

Routes are protected via middleware (`middleware.ts`):

### Public Routes
- `/` - Home page
- `/art/*` - Public artwork pages
- `/galleries` - Public gallery listing
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Protected Routes
- `/user/*` - Requires USER role (redirects to `/auth/login`)
- `/admin/*` - Requires ADMIN role (redirects to `/auth/login`)
- `/order/success`, `/order/cancel` - Requires authentication

### Automatic Redirects
- Logged-in users accessing `/auth/login` or `/auth/register` → redirect to `/user/dashboard`
- Non-admins accessing `/admin/*` → redirect to `/auth/login`
- Non-authenticated users accessing protected routes → redirect to `/auth/login`

## Checkout Flow

The checkout process now requires authentication:

1. **Before**: User must be logged in
2. **During**: `/api/checkout` validates user_session cookie
3. **Order Creation**: Order is linked to user ID for history tracking
4. **After**: User can view order in `/user/orders`

## Migration from Legacy Admin System

The old admin_session="1" cookie is still supported for backward compatibility:

- Old admin routes still work with `admin_session` cookie
- New auth system uses `user_session` cookie with role-based access
- Middleware supports both systems
- Recommendation: Migrate to new system for better security

## Future Improvements

1. **Password Security**: Upgrade from SHA-256 to bcrypt
2. **Email Verification**: Require email confirmation on signup
3. **Password Reset**: Implement forgot password flow
4. **Two-Factor Authentication**: Add optional 2FA
5. **Wishlist Feature**: Separate wishlist from favorites
6. **Audit Logging**: Track auth events and admin actions
7. **Session Management**: Allow users to view and revoke active sessions
8. **OAuth Integration**: Add social login (Google, GitHub, etc.)

## Database Changes

The `User` model was added to the Prisma schema:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // SHA-256 hashed
  name      String
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  favorites String?  // JSON array of artwork IDs
  wishlist  String?  // JSON array of wishlist items
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum UserRole {
  USER
  ADMIN
}
```

## Testing Authentication

### Register a Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "confirmPassword": "TestPass123",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }' \
  -c cookies.txt
```

### Check Session
```bash
curl http://localhost:3000/api/auth/session \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Troubleshooting

### Session Not Persisting
- Verify cookies are enabled in browser
- Check that `user_session` cookie is being set
- Ensure middleware.ts is properly configured

### Admin Routes Not Accessible
- Verify user has ADMIN role in database
- Check that user_session cookie contains role
- Clear browser cookies and re-login

### Login Redirects to Same Page
- Browser may have cached redirect
- Clear browser cookies and cache
- Try in incognito/private window

### Password Reset Needed
- Currently not supported
- Create new account with different email
- Or manually update password in database via Prisma Studio
