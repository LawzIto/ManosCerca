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
      { url: "/icons/favicon-48.png?v=2", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/brand/logos_SVG/isotipo_color.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/icons/favicon-48.png?v=2",
    apple: [
      { url: "/icons/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
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

