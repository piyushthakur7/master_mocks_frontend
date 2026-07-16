import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
