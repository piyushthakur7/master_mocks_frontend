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
    const backendUrl = process.env.BACKEND_URL || "https://backend.mastermocks.in";
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
