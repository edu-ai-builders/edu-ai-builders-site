import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The two Git routes became one course. Old links, shared URLs and
      // progress-bearing bookmarks keep working instead of 404ing.
      {
        source: "/learn/git-first-checkpoint",
        destination: "/learn/github-starter",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
