"use client";

import Image from "next/image";
import { useState } from "react";
import { ATRES_IMAGE_PLACEHOLDER } from "@/lib/local-media";
import {
  isUnsupportedExternalImageUrl,
  normalizePublicImageUrl,
} from "@/lib/image-url";

type SafeProductImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

function resolveInitialSrc(src: string) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return ATRES_IMAGE_PLACEHOLDER;
  if (isUnsupportedExternalImageUrl(trimmed)) return ATRES_IMAGE_PLACEHOLDER;
  return normalizePublicImageUrl(trimmed) || ATRES_IMAGE_PLACEHOLDER;
}

/**
 * Storefront images bypass Next/Vercel `/_next/image` to avoid HTTP 402
 * from image-optimization quotas. Supabase/local assets are served directly.
 */
export function SafeProductImage({
  src,
  alt,
  priority = false,
  sizes,
  className,
}: SafeProductImageProps) {
  const resolvedSrc = resolveInitialSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === resolvedSrc;
  const displaySrc = failed ? ATRES_IMAGE_PLACEHOLDER : resolvedSrc;

  return (
    <Image
      src={displaySrc}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      unoptimized
      className={className}
      onError={() => {
        if (resolvedSrc === ATRES_IMAGE_PLACEHOLDER || failed) return;
        setFailedSrc(resolvedSrc);
      }}
    />
  );
}
