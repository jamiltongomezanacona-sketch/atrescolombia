import Image from "next/image";

type SafeProductImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80";

export function SafeProductImage({
  src,
  alt,
  priority = false,
  sizes,
  className,
}: SafeProductImageProps) {
  const imageSrc = src?.trim() ? src : FALLBACK_IMAGE;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
