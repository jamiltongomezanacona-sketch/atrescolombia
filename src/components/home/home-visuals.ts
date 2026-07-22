import type { StoreCategory } from "@/lib/store-navigation";
import { isUnsplashUrl } from "@/lib/local-media";

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

/** Local hero slides used when few active banners exist in Supabase. */
export const HOME_HERO_FALLBACK_SLIDES = [
  {
    image: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
    title: "Descubre lo mejor de Colombia",
    subtitle: "Moda, productos y emprendimientos colombianos en un solo lugar.",
    href: "/productos",
  },
  {
    image: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
    title: "Novedades en la vitrina",
    subtitle: "Explora lo mas reciente del catalogo ATRES.",
    href: "/novedades",
  },
  {
    image: "/assets/atres-curated/banners/banner-campana_atres-003.webp",
    title: "Moda para hombre",
    subtitle: "Prendas y propuestas del departamento masculino.",
    href: "/categoria/hombre",
  },
  {
    image: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
    title: "Moda para mujer",
    subtitle: "Descubre prendas y colecciones del departamento femenino.",
    href: "/categoria/mujer",
  },
  {
    image: "/assets/atres-curated/banners/banner-campana_atres-007.webp",
    title: "Ofertas del momento",
    subtitle: "Productos con precio especial en el catalogo.",
    href: "/ofertas",
  },
] as const;

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
  if (image && !isUnsplashUrl(image)) return image;

  const key = `${category.slug} ${category.name} ${category.shortName}`.toLowerCase();
  if (key.includes("hombre")) return HOME_CATEGORY_IMAGES.hombre;
  if (key.includes("mujer")) return HOME_CATEGORY_IMAGES.mujer;
  if (key.includes("nino") || key.includes("nina") || key.includes("infantil") || key.includes("bebe")) {
    return HOME_CATEGORY_IMAGES.ninos;
  }
  if (key.includes("hogar") || key.includes("textil")) return HOME_CATEGORY_IMAGES.hogar;
  return HOME_CATEGORY_IMAGES.default;
}
