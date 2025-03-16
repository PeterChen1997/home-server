import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["www.google.com"],
  },
  eslint: {
    // 禁用构建时的 ESLint 检查
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
