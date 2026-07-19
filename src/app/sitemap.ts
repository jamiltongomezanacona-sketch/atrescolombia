import type { MetadataRoute } from "next";
import { getPublicCategories, getPublicProducts } from "@/lib/public-store";

const baseUrl = "https://atrescolombia.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);

  return [
    "",
    "/productos",
    "/categorias",
    "/ofertas",
    "/promociones",
    "/novedades",
    "/buscar",
    ...categories.map((category) => `/categoria/${category.slug}`),
    ...products.map((product) => `/productos/${product.slug}`),
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.includes("/productos/") ? "weekly" : "daily",
    priority:
      path === ""
        ? 1
        : path.includes("/productos/")
          ? 0.8
          : path === "/buscar"
            ? 0.5
            : 0.7,
  }));
}
