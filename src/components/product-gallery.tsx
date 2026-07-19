"use client";

import { useEffect, useRef, useState } from "react";
import { SafeProductImage } from "@/components/safe-product-image";
import { useProductSelection } from "@/components/product-selection-context";

type ProductGalleryProps = {
  productName: string;
};

export function ProductGallery({ productName }: ProductGalleryProps) {
  const {
    selectedImage,
    selectedImageIndex,
    selectedImages,
    setSelectedImageIndex,
    nextImage,
    previousImage,
  } = useProductSelection();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

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
      <div className="grid gap-3 sm:grid-cols-[1fr_116px]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-muted text-left shadow-soft ring-1 ring-white/60"
          aria-label="Abrir galeria de imagenes"
        >
          <SafeProductImage
            src={selectedImage}
            alt={productName}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover transition duration-300 group-hover:scale-[1.015]"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            Ver galeria
          </span>
        </button>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-1 sm:gap-3">
          {selectedImages.map((image, index) => {
            const active = index === selectedImageIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Ver imagen ${index + 1} de ${selectedImages.length}`}
                aria-current={active ? "true" : undefined}
                className={`relative aspect-square overflow-hidden rounded-lg bg-surface-muted shadow-soft transition ${
                  active
                    ? "ring-2 ring-black ring-offset-2 ring-offset-white"
                    : "ring-1 ring-white/70 hover:ring-black/35"
                }`}
              >
                <SafeProductImage
                  src={image}
                  alt={`${productName} imagen ${index + 1}`}
                  sizes="116px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[90] grid place-items-center bg-black/92 p-3 text-white backdrop-blur-sm"
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
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white text-xl font-medium text-black"
            aria-label="Cerrar galeria"
          >
            x
          </button>

          <button
            type="button"
            onClick={previousImage}
            className="absolute left-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl font-medium text-black md:left-6"
            aria-label="Imagen anterior"
          >
            &lt;
          </button>

          <div className="relative h-[82vh] w-full max-w-5xl overflow-hidden rounded-xl bg-black">
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
            className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl font-medium text-black md:right-6"
            aria-label="Imagen siguiente"
          >
            &gt;
          </button>

          <div className="absolute bottom-4 left-1/2 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/55 px-3 py-2 backdrop-blur">
            {selectedImages.map((image, index) => (
              <button
                key={`lightbox-${image}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                className={`relative size-12 shrink-0 overflow-hidden rounded-full bg-white/10 ${
                  index === selectedImageIndex ? "ring-2 ring-white" : "ring-1 ring-white/30"
                }`}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <SafeProductImage src={image} alt="" sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
