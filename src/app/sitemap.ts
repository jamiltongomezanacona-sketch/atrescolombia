import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/store-data";

const baseUrl = "https://atrescolombia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/productos",
    "/buscar",
    "/ofertas",
    "/promociones",
    "/novedades",
    "/favoritos",
    "/carrito",
    ...categories.map((category) => `/categoria/${category.slug}`),
    ...products.map((product) => `/productos/${product.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.includes("/productos/") ? "weekly" : "daily",
    priority: path === "" ? 1 : path.includes("/productos/") ? 0.8 : 0.7,
  }));
}
