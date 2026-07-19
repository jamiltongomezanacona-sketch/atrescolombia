"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeProductImage } from "@/components/safe-product-image";

type ProductGalleryProps = {
  productName: string;
  images: string[];
};

const FALLBACK_IMAGES = ["/icono.png"];

export function ProductGallery({ productName, images }: ProductGalleryProps) {
  const selectedImages = useMemo(() => sanitizeImages(images), [images]);
  const [rawSelectedImageIndex, setRawSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const selectedImageIndex = wrapIndex(rawSelectedImageIndex, selectedImages.length);
  const selectedImage = selectedImages[selectedImageIndex] ?? selectedImages[0] ?? FALLBACK_IMAGES[0];

  const setSelectedImageIndex = useCallback((index: number) => {
    setRawSelectedImageIndex(wrapIndex(index, selectedImages.length));
  }, [selectedImages.length]);

  const nextImage = useCallback(() => {
    setSelectedImageIndex(selectedImageIndex + 1);
    setZoomed(false);
  }, [selectedImageIndex, setSelectedImageIndex]);

  const previousImage = useCallback(() => {
    setSelectedImageIndex(selectedImageIndex - 1);
    setZoomed(false);
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
      if (event.key === "+" || event.key === "=") setZoomed(true);
      if (event.key === "-" || event.key === "0") setZoomed(false);
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
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/72 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            Ver galeria
          </span>
          {selectedImages.length > 1 ? (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-black shadow-sm">
              {selectedImageIndex + 1}/{selectedImages.length}
            </span>
          ) : null}
        </button>

        <div className="atres-scroll grid grid-cols-5 gap-2 overflow-x-auto sm:grid-cols-1 sm:gap-3 sm:overflow-visible">
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
            onClick={() => {
              setLightboxOpen(false);
              setZoomed(false);
            }}
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

          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/55 p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setZoomed(false)}
              className={`h-9 rounded-full px-3 text-xs font-medium ${!zoomed ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
              aria-pressed={!zoomed}
            >
              Ajustar
            </button>
            <button
              type="button"
              onClick={() => setZoomed(true)}
              className={`h-9 rounded-full px-3 text-xs font-medium ${zoomed ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
              aria-pressed={zoomed}
            >
              Zoom
            </button>
          </div>

          <button
            type="button"
            onClick={() => setZoomed((current) => !current)}
            className={`relative h-[82vh] w-full max-w-5xl overflow-hidden rounded-xl bg-black ${zoomed ? "cursor-zoom-out overflow-auto" : "cursor-zoom-in"}`}
            aria-label={zoomed ? "Quitar zoom" : "Ampliar imagen"}
          >
            <SafeProductImage
              src={selectedImage}
              alt={productName}
              sizes="100vw"
              className={`transition duration-300 ${zoomed ? "scale-150 object-contain" : "object-contain"}`}
            />
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl font-medium text-black md:right-6"
            aria-label="Imagen siguiente"
          >
            &gt;
          </button>

          <div className="atres-scroll absolute bottom-4 left-1/2 flex max-w-[92vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-full bg-black/55 px-3 py-2 backdrop-blur">
            {selectedImages.map((image, index) => (
              <button
                key={`lightbox-${image}-${index}`}
                type="button"
                onClick={() => {
                  setSelectedImageIndex(index);
                  setZoomed(false);
                }}
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

function sanitizeImages(images: string[]) {
  const unique = Array.from(new Set(images.map((image) => image.trim()).filter(Boolean)));
  return unique.length ? unique : FALLBACK_IMAGES;
}

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}
