import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // `domains` is deprecated. Use `remotePatterns` to whitelist image sources.
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },

  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
