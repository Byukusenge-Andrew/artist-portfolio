import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Keep common hosts minimal; Supabase is our primary storage now
      // Supabase public storage for this project
      { protocol: "https", hostname: "oailqxrteoswjnlprsrn.supabase.co" },
      // Optionally allow your specific Supabase project domain via env at runtime
      // Wikimedia for external images
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
};

export default nextConfig;
