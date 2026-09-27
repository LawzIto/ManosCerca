import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // La foto de perfil (máx. 2 MB, ver AVATAR_MAX_BYTES) viaja en el FormData.
      bodySizeLimit: "3mb",
    },
  },
  async headers() {
    return [
      {
        // El service worker nunca se cachea: así los cambios llegan en la siguiente visita.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
