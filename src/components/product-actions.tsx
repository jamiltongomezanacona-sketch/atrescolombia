"use client";

import { useState } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { useProductSelection } from "@/components/product-selection-context";
import { Button } from "@/components/ui/button";
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/lib/store-data";

type ProductActionsProps = {
  product: Product;
  whatsapp?: string;
};

const CART_KEY = "atres:cart";

type CartItem = {
  slug: string;
  quantity: number;
  color: string;
  size: string;
};

function readCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [] as CartItem[];
  }
}

export function ProductActions({ product, whatsapp }: ProductActionsProps) {
  const { color, setColor, size, setSize, selectedImage } = useProductSelection();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const productUrl = getProductUrl(product.slug);
  const effectiveSelectedImage = getEffectiveProductImage(selectedImage, product);
  const whatsappUrl = whatsapp
    ? buildWhatsAppUrl(
        whatsapp,
        buildProductWhatsAppMessage(product, size, color, {
          productUrl,
          imageUrl: effectiveSelectedImage,
        }),
      )
    : null;
  const outOfStock = product.stock <= 0;

  function addToCart(goToCart = false) {
    if (outOfStock) {
      setMessage("Este producto no tiene stock disponible.");
      return;
    }

    const cart = readCart();
    const existing = cart.find(
      (item) => item.slug === product.slug && item.color === color && item.size === size,
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ slug: product.slug, quantity, color, size });
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("atres:cart-changed"));

    if (goToCart) {
      window.location.href = "/carrito";
      return;
    }

    setMessage("Producto agregado al carrito.");
  }

  async function shareProduct() {
    const url = buildSelectedImageShareUrl(product.slug, effectiveSelectedImage);
    const text = effectiveSelectedImage
      ? `${product.description}\nImagen seleccionada: ${effectiveSelectedImage}`
      : product.description;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text, url });
        return;
      }

      await navigator.clipboard.writeText(`${url}${effectiveSelectedImage ? `\nImagen: ${effectiveSelectedImage}` : ""}`);
      setMessage("Enlace copiado para compartir.");
    } catch {
      setMessage("No se pudo compartir en este navegador.");
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <OptionGroup title="Color" value={color} items={product.colors} onChange={setColor} />
      <OptionGroup title="Talla" value={size} items={product.sizes} onChange={setSize} />

      <div>
        <p className="mb-2 text-xs font-medium text-stone-500">Cantidad</p>
        <div className="inline-grid grid-cols-[44px_54px_44px] rounded-full bg-stone-100 text-center" role="group" aria-label="Cantidad">
          <button
            type="button"
            aria-label="Reducir cantidad"
            className="h-11 font-medium"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            -
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="flex h-11 items-center justify-center bg-white text-sm font-medium"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            className="h-11 font-medium"
            onClick={() => setQuantity((current) => Math.min(9, current + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Button
          type="button"
          onClick={() => addToCart(false)}
          className="rounded-full"
          disabled={outOfStock}
        >
          Agregar al carrito
        </Button>
        <Button
          type="button"
          variant="brand"
          onClick={() => addToCart(true)}
          className="rounded-full"
          disabled={outOfStock}
        >
          Comprar
        </Button>
        <FavoriteButton
          productSlug={product.slug}
          label="Agregar este producto a favoritos"
          activeLabel="Quitar este producto de favoritos"
        />
      </div>

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#25D366] px-4 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
        >
          Consultar por WhatsApp
        </a>
      ) : null}

      <Button type="button" variant="secondary" size="lg" onClick={shareProduct}>
        Compartir producto
      </Button>

      {message ? (
        <p className="text-sm font-normal text-emerald-700" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function getEffectiveProductImage(selectedImage: string, product: Product) {
  if (selectedImage && selectedImage !== "/icono.png") return selectedImage;
  if (product.image && product.image !== "/icono.png") return product.image;
  return product.images.find((image) => image && image !== "/icono.png") ?? selectedImage;
}

function getProductUrl(slug: string) {
  if (typeof window !== "undefined") {
    return new URL(`/productos/${slug}`, window.location.origin).toString();
  }

  return `https://atrescolombia.com/productos/${slug}`;
}

function buildSelectedImageShareUrl(slug: string, imageUrl: string) {
  const productUrl = getProductUrl(slug);
  if (!imageUrl) return productUrl;

  const url = new URL(productUrl);
  url.searchParams.set("imagen", imageUrl);
  return url.toString();
}

function OptionGroup({
  title,
  value,
  items,
  onChange,
}: {
  title: string;
  value: string;
  items: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-stone-500">{title}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={value === item}
            onClick={() => onChange(item)}
            className={`min-h-11 rounded-full border px-3 py-2 text-sm font-normal transition ${
              value === item
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white text-stone-700 hover:border-black"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
