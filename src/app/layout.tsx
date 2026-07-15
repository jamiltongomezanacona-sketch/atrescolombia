import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atrescolombia.com"),
  title: {
    default: "ATRES | Tienda oficial de moda",
    template: "%s | ATRES",
  },
  description:
    "Tienda oficial ATRES: moda, novedades, promociones, categorias y productos tendencia.",
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
  openGraph: {
    title: "ATRES",
    description:
      "Moda ATRES con novedades, promociones y categorias para descubrir.",
    type: "website",
    locale: "es_CO",
    images: [
      {
        url: "/icono.png",
        width: 1254,
        height: 1254,
        alt: "ATRES",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
