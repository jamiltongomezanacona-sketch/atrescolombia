const SUPABASE_RENDER_IMAGE_SEGMENT = "/storage/v1/render/image/public/";
const SUPABASE_PUBLIC_OBJECT_SEGMENT = "/storage/v1/object/public/";

/**
 * Normalize Supabase storage URLs.
 * Does not alter valid Supabase object URLs; never rewrites to external CDNs.
 */
export function normalizePublicImageUrl(src: string) {
  const value = src.trim();
  if (!value) return value;

  if (!value.includes(SUPABASE_RENDER_IMAGE_SEGMENT)) {
    return value;
  }

  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(
      SUPABASE_RENDER_IMAGE_SEGMENT,
      SUPABASE_PUBLIC_OBJECT_SEGMENT,
    );
    url.search = "";
    return url.toString();
  } catch {
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
