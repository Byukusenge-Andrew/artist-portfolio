import { Instagram, Mail, Heart, ExternalLink } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto border-t border-teal-100/50 bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" />
              <span className="font-bold text-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                Artelier
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Discover exceptional artwork from talented artists around the world. Explore, collect, and connect with creativity.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/galleries" className="text-sm text-gray-600 hover:text-teal-700 transition-colors inline-flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">→</span>
                Galleries
              </Link>
              <Link href="/admin/login" className="text-sm text-gray-600 hover:text-teal-700 transition-colors inline-flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">→</span>
                Artist Login
              </Link>
              <Link href="/admin/signup" className="text-sm text-gray-600 hover:text-teal-700 transition-colors inline-flex items-center gap-2 group">
                <span className="group-hover:translate-x-1 transition-transform">→</span>
                Join as Artist
              </Link>
            </nav>
          </div>

          {/* Connect section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Connect</h3>
            <div className="flex flex-col gap-3">
              <a 
                className="group inline-flex items-center gap-3 rounded-lg px-4 py-3 bg-white hover:bg-gradient-to-br hover:from-teal-50 hover:to-emerald-50 border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:shadow-md text-sm font-medium text-gray-700 hover:text-teal-800" 
                href="mailto:hello@Artelier.com"
              >
                <Mail className="size-5 group-hover:scale-110 transition-transform" />
                <span>hello@Artelier.com</span>
              </a>
              <a 
                className="group inline-flex items-center gap-3 rounded-lg px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:shadow-lg text-sm font-medium text-white" 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Instagram className="size-5 group-hover:scale-110 transition-transform" />
                <span>Follow on Instagram</span>
                <ExternalLink className="size-3 ml-auto opacity-70" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>© {currentYear} Artelier</span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              Made with <Heart className="size-3 fill-red-500 text-red-500 animate-pulse" /> for artists
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-teal-700 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-teal-700 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



