"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ColorGalleryMap = Record<string, string[]>;

type ProductSelectionContextValue = {
  color: string;
  setColor: (value: string) => void;
  size: string;
  setSize: (value: string) => void;
  selectedImage: string;
  selectedImageIndex: number;
  selectedImages: string[];
  setSelectedImageIndex: (index: number) => void;
  nextImage: () => void;
  previousImage: () => void;
};

type ProductSelectionProviderProps = {
  children: React.ReactNode;
  productName: string;
  images: string[];
  colors: string[];
  sizes: string[];
  colorGalleries?: ColorGalleryMap;
};

const ProductSelectionContext = createContext<ProductSelectionContextValue | null>(null);
const FALLBACK_IMAGES = ["/assets/atres-curated/placeholder.webp"];

export function ProductSelectionProvider({
  children,
  productName,
  images,
  colors,
  sizes,
  colorGalleries = {},
}: ProductSelectionProviderProps) {
  const allImages = useMemo(() => sanitizeImages(images), [images]);
  const [color, setColorState] = useState(colors[0] ?? "");
  const [size, setSize] = useState(sizes[0] ?? "");
  const [rawSelectedImageIndex, setSelectedImageIndexState] = useState(0);

  const selectedImages = useMemo(() => {
    const colorGallery = color ? colorGalleries[color] : undefined;
    // Only switch gallery when the color has real images. sanitizeImages([]) returns
    // the icon fallback and must not override the product gallery.
    if (colorGallery?.some((image) => image.trim())) {
      return sanitizeImages(colorGallery);
    }
    return allImages;
  }, [allImages, color, colorGalleries]);

  const selectedImageIndex = selectedImages.length ? wrapIndex(rawSelectedImageIndex, selectedImages.length) : 0;
  const selectedImage = selectedImages[selectedImageIndex] ?? selectedImages[0] ?? FALLBACK_IMAGES[0];

  useEffect(() => {
    const element = document.querySelector<HTMLElement>("[data-whatsapp-product-name]");
    if (!element) return;

    element.dataset.whatsappProductName = productName;
    element.dataset.whatsappProductColor = color;
    element.dataset.whatsappProductSize = size;
    element.dataset.whatsappProductImage = selectedImage;
    window.dispatchEvent(new Event("atres:product-selection-changed"));
  }, [color, productName, selectedImage, size]);

  const setColor = useCallback((value: string) => {
    setColorState(value);
    setSelectedImageIndexState(0);
  }, []);

  const setSelectedImageIndex = useCallback((index: number) => {
    if (!selectedImages.length) return;
    setSelectedImageIndexState(wrapIndex(index, selectedImages.length));
  }, [selectedImages.length]);

  const nextImage = useCallback(() => {
    setSelectedImageIndex(selectedImageIndex + 1);
  }, [selectedImageIndex, setSelectedImageIndex]);

  const previousImage = useCallback(() => {
    setSelectedImageIndex(selectedImageIndex - 1);
  }, [selectedImageIndex, setSelectedImageIndex]);

  const value = useMemo(
    () => ({
      color,
      setColor,
      size,
      setSize,
      selectedImage,
      selectedImageIndex,
      selectedImages,
      setSelectedImageIndex,
      nextImage,
      previousImage,
    }),
    [color, nextImage, previousImage, selectedImage, selectedImageIndex, selectedImages, setColor, setSelectedImageIndex, size],
  );

  return <ProductSelectionContext.Provider value={value}>{children}</ProductSelectionContext.Provider>;
}

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error("useProductSelection must be used inside ProductSelectionProvider.");
  }
  return context;
}

function sanitizeImages(images: string[]) {
  const unique = Array.from(new Set(images.map((image) => image.trim()).filter(Boolean)));
  return unique.length ? unique : FALLBACK_IMAGES;
}

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}
