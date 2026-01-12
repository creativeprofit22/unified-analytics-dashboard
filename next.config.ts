import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,

  // Logging for build insights
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Bundle optimization
  bundlePagesRouterDependencies: true,

  // Experimental optimizations
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ["clsx", "tailwind-merge"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
