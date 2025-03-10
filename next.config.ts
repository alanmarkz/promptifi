import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    domains: ["coinmarketcap.com"],
  },
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
};

export default nextConfig;
