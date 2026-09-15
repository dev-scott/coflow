import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" is only for Docker. On Vercel, it causes ENOENT on next-server.js.nft.json
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  // Proxy API calls to avoid CORS in development
  async rewrites() {
    const rawApi = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
    const baseOrigin = rawApi.replace(/\/api-v1\/?$/, "").replace(/\/$/, "");
    return [
      {
        source: "/api-v1/:path*",
        destination: `${baseOrigin}/api-v1/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // Turbopack (stable in Next.js 15)
  turbopack: {},
};

export default nextConfig;
