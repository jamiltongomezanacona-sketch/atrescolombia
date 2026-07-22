/** Local curated media — prefer these over remote Unsplash hotlinks. */

export const LOCAL_MEDIA = {
  default: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
  hombre: "/assets/atres-curated/banners/banner-campana_atres-003.webp",
  mujer: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
  ninos: "/assets/atres-curated/products/producto-moda_infantil-001.webp",
  ninas: "/assets/atres-curated/products/producto-moda_infantil-008.webp",
  hogar: "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
  jeans: "/assets/atres-curated/banners/banner-campana_atres-007.webp",
  deportivo: "/assets/atres-curated/banners/banner-campana_atres-008.webp",
  uniformes: "/assets/atres-curated/banners/banner-campana_atres-005.webp",
  elegante: "/assets/atres-curated/banners/banner-campana_atres-006.webp",
  urbana: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
  pijamas: "/assets/atres-curated/banners/banner-campana_atres-009.webp",
  accesorios: "/assets/atres-curated/banners/banner-campana_revision_marca-011.webp",
  calzado: "/assets/atres-curated/banners/banner-campana_revision_marca-012.webp",
  novedades: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
  ofertas: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
  productA: "/assets/atres-curated/products/producto-moda_infantil-012.webp",
  productB: "/assets/atres-curated/products/producto-moda_infantil-020.webp",
  productC: "/assets/atres-curated/products/producto-moda_infantil-030.webp",
  productD: "/assets/atres-curated/products/producto-moda_infantil-040.webp",
  productE: "/assets/atres-curated/products/producto-moda_infantil-050.webp",
  productF: "/assets/atres-curated/products/producto-moda_infantil-060.webp",
} as const;

const PRODUCT_ROTATION = [
  LOCAL_MEDIA.productA,
  LOCAL_MEDIA.productB,
  LOCAL_MEDIA.productC,
  LOCAL_MEDIA.productD,
  LOCAL_MEDIA.productE,
  LOCAL_MEDIA.productF,
  LOCAL_MEDIA.ninos,
  LOCAL_MEDIA.ninas,
] as const;

/** Stable local path for any remote Unsplash URL (avoids HTTP 402 hotlink failures). */
export function localFallbackForRemoteImage(src: string, salt = 0) {
  const value = src.trim();
  if (!/images\.unsplash\.com/i.test(value)) return value;

  let hash = salt;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return PRODUCT_ROTATION[hash % PRODUCT_ROTATION.length];
}

export function isUnsplashUrl(src: string) {
  return /images\.unsplash\.com/i.test(src.trim());
}
