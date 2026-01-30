import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userSession = request.cookies.get("user_session")?.value;

  // Decode user session if available (JWT verification)
  let user: { role?: string; userId?: string } | null = null;
  if (userSession) {
    const payload = await verifyToken(userSession);
    if (payload && payload.type === "access") {
      user = {
        role: payload.role,
        userId: payload.userId,
      };
    } else {
      // Fallback to legacy base64 format for backward compatibility
      try {
        const decoded = JSON.parse(Buffer.from(userSession, "base64").toString());
        user = decoded;
      } catch (e) {
        // Invalid session
      }
    }
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  // Public routes - allow access
  if (pathname === "/" || pathname.startsWith("/art/") || pathname.startsWith("/galleries") || pathname.startsWith("/site/")) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Auth routes - redirect if already authenticated
  if ((pathname === "/auth/login" || pathname === "/auth/register") && isAuthenticated) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    const isPublicAdminPage = pathname === "/admin/login" || pathname === "/admin/signup";
    if (!isPublicAdminPage && !isAdmin) {
      // Preserve redirect URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if admin is approved (except for pending-approvals page)
    if (isAdmin && !isPublicAdminPage && pathname !== "/admin/pending-approvals") {
      // Note: We can't easily check isApproved here without a database call
      // The login route already handles this check
      // If an unapproved admin somehow gets a session, they'll be blocked at login
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // User routes - require authentication
  if (pathname.startsWith("/user")) {
    if (!isAuthenticated) {
      // Preserve redirect URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Protected checkout route
  if (pathname === "/order/success" || pathname === "/order/cancel") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  return addSecurityHeaders(NextResponse.next());
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://res.cloudinary.com; frame-src https://js.stripe.com;"
  );

  // HTTP Strict Transport Security
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/auth/:path*",
    "/order/:path*",
  ],
};



