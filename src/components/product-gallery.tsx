"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeProductImage } from "@/components/safe-product-image";

type ProductGalleryProps = {
  productName: string;
  images: string[];
};

const FALLBACK_IMAGES = ["/assets/atres-curated/placeholder.webp"];

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const selectedImages = useMemo(() => sanitizeImages(images), [images]);
  const [rawSelectedImageIndex, setRawSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const selectedImageIndex = wrapIndex(rawSelectedImageIndex, selectedImages.length);
  const selectedImage = selectedImages[selectedImageIndex] ?? selectedImages[0] ?? FALLBACK_IMAGES[0];

  const setSelectedImageIndex = useCallback((index: number) => {
    setRawSelectedImageIndex(wrapIndex(index, selectedImages.length));
  }, [selectedImages.length]);

  const nextImage = useCallback(() => {
    setSelectedImageIndex(selectedImageIndex + 1);
  }, [selectedImageIndex, setSelectedImageIndex]);

  const previousImage = useCallback(() => {
    setSelectedImageIndex(selectedImageIndex - 1);
  }, [selectedImageIndex, setSelectedImageIndex]);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>("[data-whatsapp-product-name]");
    if (!element) return;

    element.dataset.whatsappProductImage = selectedImage;
    window.dispatchEvent(new Event("atres:product-selection-changed"));
  }, [selectedImage]);

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") nextImage();
      if (event.key === "ArrowLeft") previousImage();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, nextImage, previousImage]);

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - clientX;
    touchStartX.current = null;

    if (Math.abs(delta) < 42) return;
    if (delta > 0) nextImage();
    else previousImage();
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_88px] lg:grid-cols-[minmax(0,1fr)_96px] lg:gap-4">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-surface-muted text-left"
          aria-label="Abrir galeria de imagenes"
        >
          <SafeProductImage
            src={selectedImage}
            alt={productName}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-[var(--radius-card)] bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            Ampliar
          </span>
          {selectedImages.length > 1 ? (
            <span className="pointer-events-none absolute left-3 top-3 rounded-[var(--radius-card)] bg-white/92 px-2 py-0.5 text-[11px] font-medium text-ink backdrop-blur-sm">
              {selectedImageIndex + 1} / {selectedImages.length}
            </span>
          ) : null}
        </button>

        <div className="atres-scroll grid grid-cols-5 gap-2 overflow-x-auto sm:grid-cols-1 sm:gap-2.5 sm:overflow-visible">
          {selectedImages.map((image, index) => {
            const active = index === selectedImageIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Ver imagen ${index + 1} de ${selectedImages.length}`}
                aria-current={active ? "true" : undefined}
                className={`relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-surface-muted transition ${
                  active
                    ? "ring-2 ring-ink ring-offset-2 ring-offset-background"
                    : "ring-1 ring-black/8 hover:ring-black/25"
                }`}
              >
                <SafeProductImage
                  src={image}
                  alt={`${productName} imagen ${index + 1}`}
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/94 p-0 text-white backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de producto"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            handleTouchEnd(event.changedTouches[0]?.clientX ?? 0);
          }}
        >
          <button
            type="button"
            onClick={() => {
              setLightboxOpen(false);
            }}
            className="absolute right-3 top-3 z-20 grid size-11 place-items-center rounded-[var(--radius-card)] bg-white text-xl font-medium text-ink shadow-sm md:right-6 md:top-6"
            aria-label="Cerrar galeria"
          >
            &times;
          </button>

          <button
            type="button"
            onClick={previousImage}
            className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-[var(--radius-card)] bg-white/92 text-2xl font-medium text-ink md:left-6"
            aria-label="Imagen anterior"
          >
            &lsaquo;
          </button>

          <div className="relative h-[calc(100dvh-104px)] w-full overflow-hidden bg-black md:h-[86vh] md:max-w-5xl md:rounded-[var(--radius-card)]">
            <SafeProductImage
              src={selectedImage}
              alt={productName}
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-[var(--radius-card)] bg-white/92 text-2xl font-medium text-ink md:right-6"
            aria-label="Imagen siguiente"
          >
            &rsaquo;
          </button>

          <div className="atres-scroll absolute bottom-4 left-1/2 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-[var(--radius-card)] bg-black/55 px-2.5 py-2 backdrop-blur">
            {selectedImages.map((image, index) => (
              <button
                key={`lightbox-${image}-${index}`}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(index);
                }}
                className={`relative size-11 shrink-0 overflow-hidden rounded-[var(--radius-card)] bg-white/10 ${
                  index === selectedImageIndex ? "ring-2 ring-white" : "ring-1 ring-white/30"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <SafeProductImage src={image} alt="" sizes="44px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function sanitizeImages(images: string[]) {
  const unique = Array.from(new Set(images.map((image) => image.trim()).filter(Boolean)));
  return unique.length ? unique : FALLBACK_IMAGES;
}

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}
