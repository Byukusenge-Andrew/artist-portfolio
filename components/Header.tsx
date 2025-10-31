import Link from "next/link";
import { cookies } from "next/headers";
import { Images, Plus, LogOut, Shield,} from "lucide-react";
import SearchBox from "./SearchBox";
import Logo from "./Logo";
import FavoritesButton from "./FavoritesButton";

export default async function Header() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "1";

  return (
    <header className="sticky top-0 z-50 px-8 border-b border-teal-100/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6 justify-between">
        <div className="flex items-center gap-6 min-w-0 flex-1">
          <Link href="/" className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <Logo className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent group-hover:from-teal-700 group-hover:via-emerald-700 group-hover:to-teal-800 transition-all duration-300">
              ArtistryHub
            </span>
          </Link>

          {/* Search - client component */}
          <div className="hidden md:block md:flex-1 md:max-w-md">
            <SearchBox />
          </div>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/galleries"
            className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300 hover:shadow-sm"
            aria-label="View galleries"
          >
            <Images className="size-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-medium">Galleries</span>
          </Link>
          <FavoritesButton />
          {isAdmin ? (
            <>
              <Link
                href="/artworks/new"
                className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                aria-label="Add new artwork"
              >
                <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline font-medium">New Artwork</span>
              </Link>
              <form action="/api/admin/logout" method="post">
                <button
                  className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                  aria-label="Logout"
                >
                  <LogOut className="size-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-medium">Logout</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/login"
                className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-gray-700 hover:text-teal-800 hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 transition-all duration-300"
                aria-label="Admin login"
              >
                <Shield className="size-4 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-medium">Admin</span>
              </Link>
              <Link
                href="/admin/signup"
                className="group inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                aria-label="Artist signup"
              >
                <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-medium">Sign up</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}


