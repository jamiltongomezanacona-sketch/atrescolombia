"use client";

import { useState } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import { useProductSelection } from "@/components/product-selection-context";
import { Button } from "@/components/ui/button";
import { buildProductWhatsAppMessage, buildWhatsAppUrl, resolveStoreWhatsapp } from "@/lib/whatsapp";
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
  const whatsappUrl = buildWhatsAppUrl(
    resolveStoreWhatsapp(whatsapp),
    buildProductWhatsAppMessage(product, size, color, {
      productUrl,
    }),
  );
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
    <div className="mt-4 space-y-3.5">
      <OptionGroup title="Color" value={color} items={product.colors} onChange={setColor} />
      <OptionGroup
        title="Talla"
        value={size}
        items={product.sizes}
        onChange={setSize}
        selectedHint={size ? `Talla seleccionada: ${size}` : undefined}
      />

      <div>
        <p className="mb-1.5 text-[10px] font-medium tracking-wide text-ink-muted sm:text-[11px]">Cantidad</p>
        <div
          className="inline-grid grid-cols-[40px_48px_40px] overflow-hidden rounded-[var(--radius-card)] bg-surface-muted text-center ring-1 ring-white/10"
          role="group"
          aria-label="Cantidad"
        >
          <button
            type="button"
            aria-label="Reducir cantidad"
            className="h-10 font-medium text-ink transition hover:bg-black-main hover:text-gold-light"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            −
          </button>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="flex h-10 items-center justify-center bg-surface text-sm font-medium text-ink"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Aumentar cantidad"
            className="h-10 font-medium text-ink transition hover:bg-black-main hover:text-gold-light"
            onClick={() => setQuantity((current) => Math.min(9, current + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <Button
            type="button"
            variant="brand"
            className="h-11 w-full"
            onClick={() => addToCart(true)}
            disabled={outOfStock}
          >
            Comprar
          </Button>
          <FavoriteButton productSlug={product.slug} compact />
        </div>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="theme-secondary-button inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-card)] px-4 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Consultar por WhatsApp
          </a>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          className="h-11 w-full"
          onClick={() => addToCart(false)}
          disabled={outOfStock}
        >
          Agregar al carrito
        </Button>

        <button
          type="button"
          onClick={shareProduct}
          className="mx-auto inline-flex min-h-10 items-center gap-1.5 text-xs font-medium text-ink-muted underline-offset-2 transition hover:text-gold-light hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ShareIcon className="size-3.5" />
          Compartir
        </button>
      </div>

      {message ? (
        <p className="text-sm font-normal text-gold-light" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function getEffectiveProductImage(selectedImage: string, product: Product) {
  if (selectedImage && selectedImage !== "/icono.png" && selectedImage !== "/assets/atres-curated/placeholder.webp") {
    return selectedImage;
  }
  if (product.image && product.image !== "/icono.png" && product.image !== "/assets/atres-curated/placeholder.webp") {
    return product.image;
  }
  return (
    product.images.find(
      (image) =>
        image && image !== "/icono.png" && image !== "/assets/atres-curated/placeholder.webp",
    ) ?? selectedImage
  );
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
  selectedHint,
}: {
  title: string;
  value: string;
  items: string[];
  onChange: (value: string) => void;
  selectedHint?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-medium tracking-wide text-ink-muted sm:text-[11px]">{title}</p>
        {selectedHint ? (
          <p className="text-[11px] font-medium text-ink sm:text-xs" aria-live="polite">
            {selectedHint}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={title}>
        {items.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={value === item}
            onClick={() => onChange(item)}
            className={`min-h-9 min-w-9 rounded-[var(--radius-card)] px-2.5 py-1.5 text-sm font-normal transition ${
              value === item
                ? "bg-gold text-black-main"
                : "bg-surface text-ink-muted ring-1 ring-white/10 hover:bg-surface-muted hover:text-gold-light"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}
