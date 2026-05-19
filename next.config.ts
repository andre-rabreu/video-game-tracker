import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://media.rawg.io/**")],
    qualities: [75, 90],
  },
};

export default nextConfig;
