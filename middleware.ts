import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const adminCookie = req.cookies.get("admin_session")?.value;
  const isLoggedIn = adminCookie === "1";

  // Protect all routes under /artworks (admin tools) except public viewing pages
  if (req.nextUrl.pathname.startsWith("/artworks")) {
    if (!isLoggedIn && !req.nextUrl.pathname.startsWith("/art/")) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect any /admin/* routes, but allow public pages like /admin/login and /admin/signup
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isPublicAdminPage =
    req.nextUrl.pathname === "/admin/login" ||
    req.nextUrl.pathname === "/admin/signup";
  if (isAdminRoute && !isPublicAdminPage) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/artworks/:path*"],
};



