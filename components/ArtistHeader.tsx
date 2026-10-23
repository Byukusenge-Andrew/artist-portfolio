"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Palette,
  LayoutDashboard,
  Plus,
  MessageSquare,
  Eye,
  LogOut,
  Sparkles,
  ChevronDown,
  ShoppingBag,
  ExternalLink,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  Compass,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import FavoritesButton from "./FavoritesButton";
import CartButton from "./CartButton";
import SearchBox from "./SearchBox";

interface ArtistHeaderProps {
  user: {
    userId: string;
    email: string;
    name?: string | null;
    role: "ARTIST";
  };
  artistData: {
    avatarUrl?: string | null;
    name?: string | null;
    bio?: string | null;
  } | null;
  pendingCommissionsCount: number;
}

export default function ArtistHeader({
  user,
  artistData,
  pendingCommissionsCount,
}: ArtistHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const displayName = artistData?.name || user.name || "Artist";
  const avatarUrl = artistData?.avatarUrl;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      label: "Dashboard",
      href: "/artist/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/artist/dashboard",
    },
    {
      label: "My Artworks",
      href: "/admin/artworks",
      icon: Palette,
      active: pathname.startsWith("/admin/artworks") && pathname !== "/admin/artworks/new",
    },
    {
      label: "Commissions",
      href: "/admin/commissions",
      icon: MessageSquare,
      badge: pendingCommissionsCount > 0 ? pendingCommissionsCount : null,
      active: pathname.includes("commissions"),
    },

    {
      label: "Marketplace",
      href: "/artworks",
      icon: Compass,
      active: pathname === "/artworks" || pathname.startsWith("/site/galleries"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/60 dark:border-gray-800 bg-white/85 dark:bg-[#14141c]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-[#14141c]/80 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Logo & Studio Badge */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <Link href="/" className="group flex items-center gap-2 hover:scale-105 transition-transform duration-300">
            <div className="dark:bg-[#faf7f2] dark:rounded-lg dark:p-0.5 transition-all duration-300">
              <Image src="/logo.png" width={34} height={34} alt="Artelier" className="sm:w-9 sm:h-9" />
            </div>
          </Link>

          {/* Artist Studio Badge */}
          <Link
            href="/artist/dashboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-purple-500/15 dark:from-teal-400/20 dark:via-emerald-400/20 dark:to-purple-400/20 border border-teal-200/80 dark:border-teal-700/50 hover:border-teal-400 transition-all group"
            title="Artist Studio Mode"
          >
            <Sparkles className="size-3 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-teal-700 via-emerald-700 to-purple-700 dark:from-teal-300 dark:via-emerald-300 dark:to-purple-300 bg-clip-text text-transparent">
              Artist Studio
            </span>
          </Link>
        </div>

        {/* Center: Search Box on Tablet/Desktop */}
        <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm">
          <SearchBox />
        </div>

        {/* Center/Right: Desktop Navigation Links for Artists */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  link.active
                    ? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/60"
                }`}
              >
                <Icon className={`size-4 ${link.active ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400"}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Upload CTA + Public Preview + Icons + Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public Profile Eye Link (Desktop) */}
          <Link
            href={`/site/artist/${user.userId}`}
            target="_blank"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700 transition-colors"
            title="View what collectors see on your public profile"
          >
            <Eye className="size-3.5" />
            <span>Public View</span>
            <ExternalLink className="size-2.5 opacity-60" />
          </Link>

          {/* Quick Upload Button */}
          <Link
            href="/admin/artworks/new"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:via-emerald-700 hover:to-teal-800 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Upload Artwork</span>
            <span className="sm:hidden">Upload</span>
          </Link>

          {/* Favorites & Cart */}
          <div className="hidden sm:flex items-center gap-1">
            <FavoritesButton />
            <CartButton />
          </div>

          <ThemeToggle />

          {/* Artist Profile Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              aria-label="Open artist profile menu"
            >
              <div className="relative size-8 sm:size-9 rounded-full overflow-hidden bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-teal-500/30">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName} fill className="object-cover" sizes="36px" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <ChevronDown className={`size-3.5 text-gray-500 dark:text-gray-400 hidden sm:block transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 dark:bg-[#181822]/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-2xl py-2 z-50 animate-scale-in divide-y divide-gray-100 dark:divide-gray-800">
                {/* User Header */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                      {displayName}
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
                      ARTIST
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {/* Studio Links */}
                <div className="py-1">
                  <Link
                    href="/artist/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <LayoutDashboard className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Artist Dashboard</span>
                  </Link>
                  <Link
                    href="/admin/artworks"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <Palette className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Manage My Artworks</span>
                  </Link>
                  <Link
                    href="/artist/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <UserIcon className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Edit Artist Profile</span>
                  </Link>
                  <Link
                    href="/admin/commissions"
                    className="flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="size-4 text-teal-600 dark:text-teal-400" />
                      <span>Commissions</span>
                    </div>
                    {pendingCommissionsCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {pendingCommissionsCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={`/site/artist/${user.userId}`}
                    target="_blank"
                    className="flex items-center justify-between px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="size-4 text-teal-600 dark:text-teal-400" />
                      <span>View Public Page</span>
                    </div>
                    <ExternalLink className="size-3 text-gray-400" />
                  </Link>
                </div>

                {/* Customer / Marketplace Switcher */}
                <div className="py-1">
                  <Link
                    href="/artworks"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Compass className="size-4 text-gray-500" />
                    <span>Browse All Artworks</span>
                  </Link>
                  <Link
                    href="/user/favorites"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ShoppingBag className="size-4 text-gray-500" />
                    <span>My Favorites & Saved</span>
                  </Link>
                </div>

                {/* Logout */}
                <div className="py-1">
                  <form action="/api/auth/logout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    >
                      <LogOut className="size-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle artist mobile navigation"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation for Artists */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-[#14141c]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-slide-down">
          <div className="pb-2">
            <SearchBox />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 px-3 py-1">
              Artist Studio
            </p>
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {link.badge} new
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/admin/artworks/new"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 text-white mt-2 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Upload New Artwork</span>
            </Link>

            <Link
              href={`/site/artist/${user.userId}`}
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <Eye className="size-4" />
                <span>Preview Public Profile</span>
              </div>
              <ExternalLink className="size-3.5 text-gray-400" />
            </Link>

            <Link
              href="/artist/profile"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <UserIcon className="size-4" />
              <span>Edit Studio Profile & Bio</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FavoritesButton />
              <CartButton />
            </div>

            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
