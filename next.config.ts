import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cap CDN caching of prerendered HTML. Default is one year (s-maxage=31536000),
  // which Hostinger's CDN obeys — after a deploy it kept serving old HTML that
  // referenced deleted /_next/static chunks (white screen). 300s bounds that
  // mismatch window to 5 minutes.
  expireTime: 300,
  async headers() {
    return [
      {
        // Everything except the content-hashed static assets (those are
        // immutable and must keep their year-long cache) and the API proxy.
        // /api/v1/* is excluded deliberately: it is rewritten to the backend
        // and carries per-user authenticated payloads (profile, attempts,
        // purchases). Marking those "public, s-maxage=300" invites a shared
        // CDN to serve one student's response to the next student.
        source: "/((?!_next/static|_next/image|api/).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=60",
          },
        ],
      },
      {
        // Per-user API responses must never be stored by a shared cache.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/register/admin/login',
        destination: '/admin/login',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    let backendUrl = process.env.BACKEND_URL || "https://backend.mastermocks.in";
    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = `https://${backendUrl}`;
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/favicon.ico",
        destination: "/logo.jpeg",
      },
    ];
  },
};

export default nextConfig;
