import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userSession = request.cookies.get("user_session")?.value;
  const adminSession = request.cookies.get("admin_session")?.value; // Legacy support

  // Decode user session if available
  let user: { role?: string } | null = null;
  if (userSession) {
    try {
      user = JSON.parse(Buffer.from(userSession, "base64").toString());
    } catch (e) {
      // Invalid session
    }
  }

  const isAuthenticated = !!userSession;
  const isAdmin = user?.role === "ADMIN" || !!adminSession; // Support both new and legacy admin

  // Public routes - allow access
  if (pathname === "/" || pathname.startsWith("/art/") || pathname.startsWith("/galleries") || pathname.startsWith("/site/")) {
    return NextResponse.next();
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
    return NextResponse.next();
  }

  // User routes - require authentication
  if (pathname.startsWith("/user")) {
    if (!isAuthenticated) {
      // Preserve redirect URL
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Protected checkout route
  if (pathname === "/order/success" || pathname === "/order/cancel") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/auth/:path*",
    "/order/:path*",
  ],
};



