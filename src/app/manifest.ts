import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "ManosCerca",
    short_name: "ManosCerca",
    description: "Técnicos del hogar cerca de ti, cuando los necesitas.",
    start_url: "/inicio",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F3F6FA",
    theme_color: "#062244",
    lang: "es",
    categories: ["lifestyle", "utilities"],
    icons: [
      {
        src: "/brand/iconos_app/icono_app_192_fondo_azul.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/iconos_app/icono_app_512_fondo_azul.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/iconos_app/icono_app_maskable_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/iconos_app/icono_app_512_fondo_blanco.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
