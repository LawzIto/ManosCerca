import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // La foto de perfil (máx. 2 MB, ver AVATAR_MAX_BYTES) viaja en el FormData.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
