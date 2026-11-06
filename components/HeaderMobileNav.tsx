"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Palette,
  Images,
  Sparkles,
  Users,
  Shield,
  Plus,
  User,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import SearchBox from "./SearchBox";

interface HeaderMobileNavProps {
  user: {
    userId: string;
    email: string;
    name?: string | null;
    role?: string;
  } | null;
  isAdmin: boolean;
  isArtist: boolean;
  pendingAdminCount: number;
}

export default function HeaderMobileNav({
  user,
  isAdmin,
  isArtist,
  pendingAdminCount,
}: HeaderMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const navLinks = [
    { label: "Artworks", href: "/artworks", icon: Palette },
    { label: "Galleries", href: "/site/galleries", icon: Images },
    { label: "Commission", href: "/site/commissions", icon: Sparkles },
    { label: "Featured Artists", href: "/site/artists", icon: Users },
  ];

  const drawerContent = isOpen && mounted ? (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-[85%] max-w-sm bg-white dark:bg-[#1a1a24] h-[100dvh] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-gray-200 dark:border-gray-800 animate-slide-in-right z-10 pb-10">
        <div>
          {/* Header inside drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Menu
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="mb-6">
            <SearchBox />
          </div>

          {/* Main Navigation Links */}
          <nav className="space-y-1 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-3 py-1">
              Explore
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-gray-500"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Admin / Artist Workspace Quick Access */}
          {(isAdmin || isArtist) && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mb-6 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-3 py-1">
                {isAdmin ? "Admin Studio" : "Artist Studio"}
              </p>

              <Link
                href={isAdmin ? "/admin/dashboard" : "/artist/dashboard"}
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Shield className="size-4 text-teal-600 dark:text-teal-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/artworks/new"
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="size-4 text-teal-600 dark:text-teal-400" />
                <span>Upload New Artwork</span>
              </Link>

              {isAdmin && pendingAdminCount > 0 && (
                <Link
                  href="/admin/pending-approvals"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="size-4" />
                    <span>Pending Approvals</span>
                  </div>
                  <span className="size-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {pendingAdminCount}
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Bottom User / Account Section */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          {user ? (
            <div className="space-y-3">
              <Link
                href={
                  isAdmin
                    ? "/admin/dashboard"
                    : isArtist
                    ? "/artist/profile"
                    : "/user/dashboard"
                }
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="size-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="size-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                    {user.name || "My Account"}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </Link>

              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border border-red-100 dark:border-red-900/30"
                >
                  <LogOut className="size-3.5" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-2.5">
              <Link
                href="/auth/login"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* Trigger Hamburger Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="size-6" />
      </button>

      {/* Full-screen Portal Drawer rendered into document.body */}
      {mounted && typeof document !== "undefined" && createPortal(drawerContent, document.body)}
    </>
  );
}
