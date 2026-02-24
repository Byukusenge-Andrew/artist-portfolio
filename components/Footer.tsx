import { Instagram, Mail, Heart, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { parseUserSession } from "@/lib/auth";

export default async function Footer() {
  const currentYear = new Date().getFullYear();

  let user: Awaited<ReturnType<typeof parseUserSession>> = null;
  try {
    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;
    user = await parseUserSession(userSession);
  } catch {
    // Gracefully degrade — show guest footer
  }

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = !!user;

  return (
    <footer className="mt-auto border-t border-teal-100/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/30 dark:from-[#141418] dark:via-[#1a1a24] dark:to-[#141418] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform duration-300 flex-shrink-0">
                <div className="dark:bg-[#faf7f2] dark:rounded-lg dark:p-0.5 transition-all duration-300">
                  <Image src="/logo.png" width={34} height={34} alt="Artelier" className="sm:w-10 sm:h-10" />
                </div>
              </Link> 
              <span className="font-bold text-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                Artelier
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Discover exceptional artwork from talented artists around the world. Explore, collect, and connect with creativity.
            </p>
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="https://www.instagram.com/by_jam_23/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="size-5 sm:size-6" />
              </a>
              <a
                href="mailto:andrebyukusenge9@gmail.com"
                className="p-2.5 sm:p-3 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all duration-300 hover:scale-110"
                aria-label="Email"
              >
                <Mail className="size-5 sm:size-6" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="space-y-4 sm:col-span-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">Explore</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/site/galleries" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">→</span>
                Galleries
              </Link>
              <Link href="/site/artist" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">→</span>
                Artist Profile
              </Link>
              <Link href="/site/commissions" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">→</span>
                Commissions
              </Link>
              {isAuthenticated && (
                <Link href="/user/favorites" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  My Favorites
                </Link>
              )}
            </nav>
          </div>

          {/* Account - Different for each user type */}
          <div className="hidden lg:block space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
              {isAuthenticated ? "My Account" : "Get Started"}
            </h3>
            <nav className="flex flex-col gap-2">
              {isAuthenticated ? (
                /* Logged in users */
                <>
                  <Link href={isAdmin ? "/admin/dashboard" : "/user/dashboard"} className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Dashboard
                  </Link>
                  {!isAdmin && (
                    <Link href="/user/orders" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                      My Orders
                    </Link>
                  )}
                  <Link href="/user/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Profile Settings
                  </Link>
                </>
              ) : (
                /* Guest users */
                <>
                  <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Login
                  </Link>
                  <Link href="/auth/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Sign Up
                  </Link>
                  <Link href="/user/favorites" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Browse Favorites
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* For Artists - Different for admins */}
          <div className="hidden lg:block space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">
              {isAdmin ? "Admin Tools" : "For Artists"}
            </h3>
            <nav className="flex flex-col gap-2">
              {isAdmin ? (
                /* Admin users */
                <>
                  <Link href="/admin/galleries" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Manage Galleries
                  </Link>
                  <Link href="/admin/artworks/new" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Upload Artwork
                  </Link>
                  <Link href="/admin/orders" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    View Orders
                  </Link>
                  <Link href="/admin/pending-approvals" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Pending Approvals
                  </Link>
                </>
              ) : isAuthenticated && user?.role === "ARTIST" ? (
                /* Artist Users */
                <>
                  <Link href="/artist/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Artist Dashboard
                  </Link>
                  <Link href="/admin/artworks/new" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Upload Artwork
                  </Link>
                  <Link href="/admin/artworks" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    My Artworks
                  </Link>
                </>
              ) : (
                /* Non-admin / Non-artist users */
                <>
                  <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Artist Login
                  </Link>
                  <Link href="/auth/artist-signup" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Join as Artist
                  </Link>
                  <Link href="/site/commissions" className="text-sm text-gray-600 dark:text-gray-400 hover:text-teal-700 dark:hover:text-teal-400 transition-colors inline-flex items-center gap-2 group">
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                    Request Commission
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 sm:pt-6 border-t border-gray-200/60 dark:border-gray-700/40 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Artelier</span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="size-3 fill-red-500 text-red-500 animate-pulse" /> for artists
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-teal-700 dark:hover:text-teal-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
