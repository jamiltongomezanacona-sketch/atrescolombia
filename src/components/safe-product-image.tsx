import Image from "next/image";

type SafeProductImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

const FALLBACK_IMAGE = "/icono.png";

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
