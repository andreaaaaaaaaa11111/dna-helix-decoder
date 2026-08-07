import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // gli appunti sono PDF: alziamo il limite di default (1 MB)
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
