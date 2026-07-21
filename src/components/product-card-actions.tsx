"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/store-data";

type ProductCardActionsProps = {
  product: Pick<Product, "slug" | "name" | "price" | "image" | "images" | "colors" | "sizes" | "stock">;
  whatsapp?: string;
  compact?: boolean;
  className?: string;
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

export function ProductCardActions(props: ProductCardActionsProps) {
  const { product, className } = props;
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const color = firstMeaningful(product.colors, "Unico");
  const size = firstMeaningful(product.sizes, "Unica");

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
    window.setTimeout(() => setAdded(false), 900);
  }

  return (
    <button
      type="button"
      disabled={outOfStock}
      title="Agregar al carrito"
      aria-label="Agregar al carrito"
      aria-live="polite"
      onClick={addToCart}
      className={cn(
        "atres-interactive inline-flex size-9 shrink-0 items-center justify-center rounded-full text-base font-medium leading-none text-white transition duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        "active:scale-95 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500",
        "sm:size-9 lg:size-10",
        added ? "atres-pop bg-emerald-600 hover:bg-emerald-600" : "bg-ink hover:bg-black",
        className,
      )}
    >
      <span aria-hidden="true">{outOfStock ? "—" : added ? "✓" : "+"}</span>
    </button>
  );
}
