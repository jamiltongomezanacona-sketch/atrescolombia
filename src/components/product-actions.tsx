"use client";

import { useState } from "react";
import { FavoriteButton } from "@/components/favorite-button";
import type { Product } from "@/lib/store-data";

type ProductActionsProps = {
  product: Product;
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

export function ProductActions({ product }: ProductActionsProps) {
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  function addToCart(goToCart = false) {
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
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, text: product.description, url });
        return;
      }

      await navigator.clipboard.writeText(url);
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
        <p className="mb-2 text-xs font-black uppercase text-stone-500">Cantidad</p>
        <div className="inline-grid grid-cols-[44px_54px_44px] bg-stone-100 text-center">
          <button
            type="button"
            className="h-11 font-black"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            -
          </button>
          <span className="flex h-11 items-center justify-center bg-white text-sm font-black">
            {quantity}
          </span>
          <button
            type="button"
            className="h-11 font-black"
            onClick={() => setQuantity((current) => Math.min(9, current + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <button
          type="button"
          onClick={() => addToCart(false)}
          className="h-12 bg-black px-4 text-sm font-black text-white transition hover:bg-stone-800"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={() => addToCart(true)}
          className="h-12 bg-orange-600 px-4 text-sm font-black text-white transition hover:bg-orange-500"
        >
          Comprar
        </button>
        <FavoriteButton
          productSlug={product.slug}
          label="Agregar este producto a favoritos"
          activeLabel="Quitar este producto de favoritos"
        />
      </div>

      <button
        type="button"
        onClick={shareProduct}
        className="h-11 w-full bg-stone-100 px-4 text-sm font-black text-stone-800 transition hover:bg-stone-200"
      >
        Compartir producto
      </button>

      {message ? <p className="text-sm font-bold text-emerald-700">{message}</p> : null}
    </div>
  );
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
      <p className="mb-2 text-xs font-black uppercase text-stone-500">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`border px-3 py-2 text-sm font-bold transition ${
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
