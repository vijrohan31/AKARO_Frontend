import type { NextConfig } from "next";
import { globalConfig } from "./lib/global.config";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://akaro.saturnai.in'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
