import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userSession = request.cookies.get("user_session")?.value;

  // Decode user session if available (JWT verification only — no DB in Edge Runtime)
  let user: { role?: string; userId?: string; sessionId?: string } | null = null;
  if (userSession) {
    const payload = await verifyToken(userSession);
    if (payload && payload.type === "access" && payload.jti) {
      // JWT is cryptographically valid — accept it in middleware.
      // Session revocation is enforced by the API routes which DO have DB access.
      user = {
        role: payload.role,
        userId: payload.userId,
        sessionId: payload.jti,
      };
    }
    // Invalid/expired JWT — session is null
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  // Public routes - allow access
  if (pathname === "/" || pathname.startsWith("/art/") || pathname.startsWith("/galleries") || pathname.startsWith("/site/")) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Auth routes - redirect if already authenticated
  if ((pathname === "/auth/login" || pathname === "/auth/register") && isAuthenticated) {
    if (user?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (user?.role === "ARTIST") {
      return NextResponse.redirect(new URL("/artist/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // Admin routes - require admin role
  if (pathname.startsWith("/admin")) {
    const isPublicAdminPage = pathname === "/admin/login" || pathname === "/admin/signup";
    // Allow ARTIST to access specific admin pages (artworks, orders, etc.)
    // We'll let the page-level checks handle detailed permissions, but we need to pass authenticated users
    if (!isAuthenticated && !isPublicAdminPage) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }


    // Strict check for admin-only pages (like user management) could go here
    // But for now, we rely on page-level checks since we share some admin routes with artists

    return addSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/docs")||pathname.startsWith("/api/docs")) {
   if(!isAuthenticated || !isAdmin){
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
   }
   return addSecurityHeaders(NextResponse.next());
  }

  // Artist routes - require artist role
  if (pathname.startsWith("/artist")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user?.role !== "ARTIST" && user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
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
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://res.cloudinary.com https://va.vercel-scripts.com; frame-src https://js.stripe.com;"
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
    "/artist/:path*",
    "/user/:path*",
    "/auth/:path*",
    "/order/:path*",
    "/docs/:path*",
    "/api/docs/:path*",
  ],
};



