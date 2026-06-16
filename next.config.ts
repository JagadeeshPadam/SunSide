import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'openweathermap.org' }
    ]
  },
  turbopack: {},
};

export default nextConfig;
