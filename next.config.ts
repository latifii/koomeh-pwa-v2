import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities listed here; 75 is the default, 90 is for
    // large hero/city photography that visibly softens at 75.
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "koomeh.ir", pathname: "/**" },
      { protocol: "https", hostname: "file.koomeh.ir", pathname: "/**" },
      { protocol: "https", hostname: "hoomeh.ir", pathname: "/**" },
    ],
  },
};

export default nextConfig;
