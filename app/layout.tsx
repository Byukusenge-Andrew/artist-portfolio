import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Artelier — Discover Exceptional Artwork",
    template: "%s | Artelier",
  },
  description:
    "Explore and collect exceptional artwork from talented artists around the world. Join our community of creators and art enthusiasts.",
  keywords: [
    "art",
    "artwork",
    "gallery",
    "artist portfolio",
    "buy art online",
    "commission art",
    "original paintings",
    "art prints",
  ],
  openGraph: {
    type: "website",
    siteName: "Artelier",
    title: "Artelier — Discover Exceptional Artwork",
    description:
      "Explore and collect exceptional artwork from talented artists worldwide.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Artelier — Discover Exceptional Artwork",
    description:
      "Explore and collect exceptional artwork from talented artists worldwide.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
