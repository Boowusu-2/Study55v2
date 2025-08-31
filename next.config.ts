import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable Fast Refresh warnings in development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize for development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };

      // Disable Fast Refresh warnings
      config.infrastructureLogging = {
        level: "error",
      };
    }
    return config;
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  redirects: async () => {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: "/api/health",
        destination: "/api/health-check",
      },
    ];
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
