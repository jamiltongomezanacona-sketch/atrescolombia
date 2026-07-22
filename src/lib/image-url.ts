const SUPABASE_RENDER_IMAGE_SEGMENT = "/storage/v1/render/image/public/";
const SUPABASE_PUBLIC_OBJECT_SEGMENT = "/storage/v1/object/public/";

/**
 * Normalize Supabase storage URLs to direct public objects.
 * Avoids /render/image (often HTTP 402 on free image transforms).
 */
export function normalizePublicImageUrl(src: string) {
  const value = src.trim();
  if (!value) return value;

  try {
    const url = new URL(value, "https://atrescolombia.local");
    const isAbsolute = /^https?:\/\//i.test(value);

    if (url.pathname.includes(SUPABASE_RENDER_IMAGE_SEGMENT)) {
      url.pathname = url.pathname.replace(
        SUPABASE_RENDER_IMAGE_SEGMENT,
        SUPABASE_PUBLIC_OBJECT_SEGMENT,
      );
      url.search = "";
      return isAbsolute ? url.toString() : `${url.pathname}${url.search}`;
    }

    // Direct object URLs: drop transform/query params that can hit paid image CDN.
    if (isAbsolute && url.hostname.endsWith("supabase.co") && url.pathname.includes(SUPABASE_PUBLIC_OBJECT_SEGMENT)) {
      url.search = "";
      return url.toString();
    }

    return value;
  } catch {
    if (!value.includes(SUPABASE_RENDER_IMAGE_SEGMENT)) return value;
    const [path] = value.split("?");
    return path.replace(SUPABASE_RENDER_IMAGE_SEGMENT, SUPABASE_PUBLIC_OBJECT_SEGMENT);
  }
}

export function isRemoteImageUrl(src: string) {
  return /^https?:\/\//i.test(src.trim());
}

/** True for http(s) URLs that are not Supabase Storage. */
export function isUnsupportedExternalImageUrl(src: string) {
  const value = src.trim();
  if (!isRemoteImageUrl(value)) return false;
  try {
    const host = new URL(value).hostname.toLowerCase();
    return !host.endsWith("supabase.co");
  } catch {
    return true;
  }
}

/**
 * Resolve a storefront image URL for display.
 * - Keeps local paths and Supabase Storage URLs.
 * - Rejects third-party remotes (no external CDN fallbacks).
 */
export function resolveStoreImageUrl(src: string | null | undefined, fallback: string) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return fallback;
  if (isUnsupportedExternalImageUrl(trimmed)) return fallback;
  return normalizePublicImageUrl(trimmed) || fallback;
}
