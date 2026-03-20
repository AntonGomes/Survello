import type { NextConfig } from "next";

const backendUrl =
  process.env.PY_BACKEND_URL ||
  (process.env.BACKEND_PORT
    ? `http://localhost:${process.env.BACKEND_PORT}`
    : "http://localhost:8000");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/py-api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
