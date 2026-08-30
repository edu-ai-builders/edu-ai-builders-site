import type { NextConfig } from "next";

const radarOrigin = (
  process.env.RADAR_ORIGIN || "https://eduos-github-radar.vercel.app"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/directory",
          destination: `${radarOrigin}/directory`,
        },
        {
          source: "/directory/:path*",
          destination: `${radarOrigin}/directory/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
