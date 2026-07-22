import type { StoreCategory } from "@/lib/store-navigation";

export const HOME_HERO_CONTENT = {
  eyebrow: "ATRES Colombia",
  title: "Descubre lo mejor de Colombia",
  subtitle: "Moda, productos y emprendimientos colombianos en un solo lugar.",
  primaryLabel: "Explorar productos",
  primaryHref: "/productos",
  secondaryLabel: "Ver novedades",
  secondaryHref: "/novedades",
  fallbackImage: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
};

export const HOME_CATEGORY_IMAGES = {
  hombre: "/assets/atres-curated/banners/banner-campana_atres-003.webp",
  mujer: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
  ninos: "/assets/atres-curated/products/producto-moda_infantil-001.webp",
  hogar: "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
  novedades: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
  ofertas: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
  default: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
};

export function getHomeCategoryImage(category: StoreCategory) {
  const image = category.image?.trim();
  if (image && !image.includes("images.unsplash.com")) return image;

  const key = `${category.slug} ${category.name} ${category.shortName}`.toLowerCase();
  if (key.includes("hombre")) return HOME_CATEGORY_IMAGES.hombre;
  if (key.includes("mujer")) return HOME_CATEGORY_IMAGES.mujer;
  if (key.includes("nino") || key.includes("nina") || key.includes("infantil") || key.includes("bebe")) {
    return HOME_CATEGORY_IMAGES.ninos;
  }
  if (key.includes("hogar") || key.includes("textil")) return HOME_CATEGORY_IMAGES.hogar;
  return HOME_CATEGORY_IMAGES.default;
}
