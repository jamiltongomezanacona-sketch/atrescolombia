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
      <span aria-hidden="true" className="grid place-items-center">
        {outOfStock ? (
          <span className="text-sm font-medium leading-none">—</span>
        ) : added ? (
          <CheckIcon />
        ) : (
          <CartIcon />
        )}
      </span>
    </button>
  );
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.05rem] fill-none stroke-current lg:size-5"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h1.6l1.35 9.2h11.3L19.5 7.2H7.1" />
      <path d="M7.1 7.2 6.1 4.8H21" />
      <circle cx="9.2" cy="18.6" r="1.35" />
      <circle cx="16.6" cy="18.6" r="1.35" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.05rem] fill-none stroke-current lg:size-5"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.5 12.5 10 17l8.5-9.5" />
    </svg>
  );
}
