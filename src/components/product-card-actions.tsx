"use client";

import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";
import { buildProductWhatsAppMessage, buildWhatsAppUrl, resolveStoreWhatsapp } from "@/lib/whatsapp";
import type { Product } from "@/lib/store-data";

type ProductCardActionsProps = {
  product: Pick<Product, "slug" | "name" | "price" | "image" | "images" | "colors" | "sizes" | "stock">;
  whatsapp?: string;
  compact?: boolean;
};

type CartItem = {
  slug: string;
  quantity: number;
  color: string;
  size: string;
};

const CART_KEY = "atres:cart";

function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [] as CartItem[];
  }
}

function firstMeaningful(values: string[], fallback: string) {
  return values.find((value) => value.trim()) ?? fallback;
}

export function ProductCardActions({ product, whatsapp, compact = false }: ProductCardActionsProps) {
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const color = firstMeaningful(product.colors, "Unico");
  const size = firstMeaningful(product.sizes, "Unica");
  const productHref = `/productos/${product.slug}`;
  const resolvedWhatsapp = resolveStoreWhatsapp(whatsapp);
  const whatsappUrl = buildWhatsAppUrl(
    resolvedWhatsapp,
    buildProductWhatsAppMessage(product, size, color),
  );

  function openWhatsapp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const source = document.querySelector<HTMLElement>("[data-atres-whatsapp]");
    const phone = resolveStoreWhatsapp(source?.dataset.atresWhatsapp ?? whatsapp);
    const url = buildWhatsAppUrl(
      phone,
      buildProductWhatsAppMessage(product, size, color),
    );

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    window.location.href = productHref;
  }

  function addToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (outOfStock) return;

    const cart = readCart();
    const existing = cart.find(
      (item) => item.slug === product.slug && item.color === color && item.size === size,
    );

    if (existing) {
      existing.quantity = Math.min(9, existing.quantity + 1);
    } else {
      cart.push({ slug: product.slug, quantity: 1, color, size });
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("atres:cart-changed"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div
      className={
        compact
          ? "mt-0 grid grid-cols-[28px_minmax(0,1fr)] gap-1 lg:grid-cols-1"
          : "mt-2 grid grid-cols-[38px_1fr] gap-1.5 sm:grid-cols-[36px_36px_1fr] lg:mt-2 lg:grid-cols-[32px_minmax(0,1fr)] lg:gap-1.5"
      }
    >
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Consultar ${product.name} por WhatsApp`}
          className={`atres-interactive grid place-items-center rounded-full bg-[#25D366] text-white shadow-sm hover:bg-[#1ebe57] lg:hidden ${compact ? "min-h-7" : "min-h-9"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <WhatsAppIcon />
        </a>
      ) : (
        <button
          type="button"
          aria-label={`Ver consulta por WhatsApp para ${product.name}`}
          onClick={openWhatsapp}
          className={`atres-interactive grid place-items-center rounded-full bg-[#25D366] text-white shadow-sm hover:bg-[#1ebe57] lg:hidden ${compact ? "min-h-7" : "min-h-9"}`}
        >
          <WhatsAppIcon />
        </button>
      )}

      {!compact ? (
        <Link
          href={productHref}
          aria-label={`Ver detalles de ${product.name}`}
          className="atres-interactive hidden min-h-9 place-items-center rounded-full bg-stone-100 text-stone-700 hover:bg-black hover:text-white sm:grid lg:min-h-9"
        >
          <EyeIcon />
        </Link>
      ) : null}

      <button
        type="button"
        disabled={outOfStock}
        aria-label={outOfStock ? `${product.name} agotado` : `Agregar ${product.name} al carrito`}
        aria-live="polite"
        onClick={addToCart}
        className={`atres-interactive inline-flex items-center justify-center rounded-full px-2 font-medium text-white hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500 ${
          compact ? "min-h-7 text-[9px] lg:min-h-7 lg:px-2 lg:text-[10px]" : "min-h-9 text-[10px] sm:text-[11px] lg:min-h-9 lg:px-3 lg:text-[11px]"
        } ${added ? "atres-pop bg-emerald-600" : "bg-black"}`}
      >
        {outOfStock ? "Agotado" : added ? "Agregado" : "Agregar"}
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
      <path d="M12.04 3.5a8.44 8.44 0 0 0-7.25 12.76L3.75 20.5l4.34-1.02A8.44 8.44 0 1 0 12.04 3.5Zm0 1.72a6.72 6.72 0 1 1-3.37 12.54l-.31-.18-2.08.49.5-2.02-.2-.32a6.72 6.72 0 0 1 5.46-10.51Zm-2.4 3.38c-.15 0-.4.05-.61.28-.21.23-.8.78-.8 1.9s.82 2.2.94 2.35c.12.16 1.6 2.55 3.96 3.46 1.96.77 2.36.62 2.79.58.42-.04 1.36-.56 1.55-1.1.19-.54.19-1 .13-1.1-.06-.09-.22-.15-.46-.27-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.41Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 fill-none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
