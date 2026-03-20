import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['xlsx'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "toskyrecords.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
