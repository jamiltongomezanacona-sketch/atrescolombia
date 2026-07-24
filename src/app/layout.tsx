import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0B",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://atrescolombia.com"),
  applicationName: "ATRES Colombia",
  manifest: "/manifest.webmanifest",
  title: {
    default: "ATRES | Tienda oficial de moda",
    template: "%s | ATRES",
  },
  description:
    "ATRES Colombia conecta moda 100% colombiana, fabricantes y talleres con clientes finales, compras por prenda y contacto al por mayor.",
  icons: {
    icon: [
      {
        url: "/icono.png",
        type: "image/png",
      },
    ],
    shortcut: "/icono.png",
    apple: "/icono.png",
  },
  appleWebApp: {
    capable: true,
    title: "ATRES",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "ATRES",
    description:
      "Moda colombiana directa: del taller al cliente, con fabricantes, talleres y prendas para descubrir.",
    type: "website",
    locale: "es_CO",
    siteName: "ATRES Colombia",
    images: [
      {
        url: "/icono.png",
        width: 1254,
        height: 1254,
        alt: "ATRES",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATRES",
    description:
      "Moda colombiana directa: del taller al cliente, con fabricantes, talleres y prendas para descubrir.",
    images: ["/icono.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
