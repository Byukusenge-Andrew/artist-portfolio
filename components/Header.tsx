import Link from "next/link";
import { cookies } from "next/headers";
import { Images, Plus, LogOut, Shield, User, Heart, Bell, Menu } from "lucide-react";
import SearchBox from "./SearchBox";
import FavoritesButton from "./FavoritesButton";
import CartButton from "./CartButton";
import Image from "next/image";
import { parseUserSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Header() {
  const cookieStore = await cookies();
  const userSession = cookieStore.get("user_session")?.value;
  const user = await parseUserSession(userSession);

  const isAdmin = user?.role === "ADMIN";
  const isArtist = user?.role === "ARTIST";
  const isAuthenticated = !!user;

  // Get pending admin count if user is admin
  let pendingAdminCount = 0;
  if (isAdmin) {
    try {
      pendingAdminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
          isApproved: false,
        },
      });
    } catch (error) {
      console.error("Error fetching pending admin count:", error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center gap-3 sm:gap-4 lg:gap-6 justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-300 flex-shrink-0">
          <Image src="/icon.png" width={34} height={34} alt="Artelier" className="sm:w-10 sm:h-10" />

        </Link>

        {/* Search - Desktop & Tablet */}
        <div className="hidden md:block md:flex-1 md:max-w-md lg:max-w-lg">
          <SearchBox />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm">
          {/* Public Links - Hidden on small mobile */}
          <Link
            href="/site/galleries"
            className="hidden sm:inline-flex group items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300"
          >
            <Images className="size-4 group-hover:scale-110 transition-transform" />
            <span className="hidden lg:inline font-medium">Galleries</span>
          </Link>

          <Link
            href="/site/commissions"
            className="hidden md:inline-flex group items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300"
          >
            <span className="hidden lg:inline font-medium">Commission</span>
            <span className="lg:hidden font-medium">Comm.</span>
          </Link>

          <FavoritesButton />
          <CartButton />

          {/* Admin/Artist Section */}
          {(isAdmin || isArtist) && (
            <>
              <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2 hidden sm:block" />

              {/* Pending Approvals Notification */}
              {pendingAdminCount > 0 && (
                <Link
                  href="/admin/pending-approvals"
                  className="relative group inline-flex items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-amber-700 hover:text-amber-800 hover:bg-amber-50 transition-all duration-300"
                  title={`${pendingAdminCount} pending admin approval${pendingAdminCount > 1 ? 's' : ''}`}
                >
                  <Bell className="size-4 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {pendingAdminCount}
                  </span>
                </Link>
              )}

              <Link
                href={isAdmin ? "/admin/dashboard" : "/artist/dashboard"}
                className="hidden sm:inline-flex group items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-gray-700 hover:text-teal-800 hover:bg-teal-50 transition-all duration-300"
              >
                <Shield className="size-4 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline font-medium">{isAdmin ? "Admin" : "Dashboard"}</span>
              </Link>

              <Link
                href="/admin/artworks/new"
                className="group inline-flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline font-medium text-sm">New</span>
              </Link>
            </>
          )}

          {/* User Menu */}
          {isAuthenticated ? (
            <>
              {!(isAdmin || isArtist) && <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2 hidden sm:block" />}

              <Link
                href={isAdmin ? "/admin/dashboard" : isArtist ? "/artist/dashboard" : "/user/dashboard"}
                className="group inline-flex items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300"
              >
                <User className="size-4 group-hover:scale-110 transition-transform" />
                <span className="hidden xl:inline font-medium max-w-[120px] truncate">{user.name || user.email}</span>
              </Link>

              <form action="/api/auth/logout" method="post">
                <button
                  className="group inline-flex items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-gray-700 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="size-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden lg:inline font-medium">Logout</span>
                </button>
              </form>
            </>
          ) : (
            /* Guest Links */
            <>
              <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2 hidden sm:block" />

              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-2 rounded-lg px-2 lg:px-3 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300"
              >
                <User className="size-4 group-hover:scale-110 transition-transform" />
                <span className="hidden lg:inline font-medium">Login</span>
              </Link>

              <Link
                href="/auth/register"
                className="group inline-flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 lg:px-4 py-2 text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium text-sm">Sign Up</span>
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-3 sm:px-4 pb-3">
        <SearchBox />
      </div>
    </header>
  );
}
