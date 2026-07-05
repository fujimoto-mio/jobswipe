import type { NextConfig } from "next";

function bucketImagePatterns() {
  const patterns: { protocol: "https"; hostname: string }[] = [];
  for (const raw of [process.env.R2_PRIVATE_BUCKET_URL]) {
    if (!raw) continue;
    try {
      patterns.push({ protocol: "https", hostname: new URL(raw).hostname });
    } catch {
      // ignore invalid URL
    }
  }
  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "media.jobswipe.jp" },
      ...bucketImagePatterns(),
    ],
  },
};

export default nextConfig;
