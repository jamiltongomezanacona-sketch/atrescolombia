import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ATRES Colombia",
    short_name: "ATRES",
    description:
      "Tienda oficial de moda ATRES Colombia. Moda 100% colombiana, del taller al cliente.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f4",
    theme_color: "#121212",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icono.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
