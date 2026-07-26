import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities listed here; 75 is the default, 90 is for
    // large hero/city photography that visibly softens at 75.
    qualities: [75, 90],
  },
};

export default nextConfig;
