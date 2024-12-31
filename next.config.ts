import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    ppr: true,
  },

  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
      {
        hostname: "pbs.twimg.com",
        protocol: "https",
      },
      {
        hostname: "i.ytimg.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
