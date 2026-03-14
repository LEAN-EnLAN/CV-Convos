import type { NextConfig } from "next";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!isDev || apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      {
        source: "/health",
        destination: "http://127.0.0.1:8000/health",
      },
      {
        source: "/ping",
        destination: "http://127.0.0.1:8000/ping",
      },
    ];
  },
};

export default nextConfig;
