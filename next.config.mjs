// File: next.config.mjs
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      recharts: path.resolve(process.cwd(), "src/lib/recharts-stub.js"),
    };
    return config;
  },
};

export default nextConfig;
