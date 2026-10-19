import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  fallback: ["Calibri", "Arial", "sans-serif"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ManosCerca",
    template: "%s · ManosCerca",
  },
  description: "Encuentra técnicos del hogar cerca de ti: plomeros, cerrajeros, electricistas y más.",
  applicationName: "ManosCerca",
  icons: {
    icon: [
      { url: "/brand/iconos_app/favicon_48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/logos_SVG/isotipo_color.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand/iconos_app/icono_app_192_fondo_azul.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#062244",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

