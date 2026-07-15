"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCOP, type Product } from "@/lib/store-data";

type CartItem = {
  slug: string;
  quantity: number;
  color: string;
  size: string;
};

type CartViewProps = {
  products: Product[];
};

const CART_KEY = "atres:cart";

function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function CartView({ products }: CartViewProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    function syncCart() {
      queueMicrotask(() => setItems(readCart()));
    }

    syncCart();
    window.addEventListener("atres:cart-changed", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("atres:cart-changed", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const rows = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((candidate) => candidate.slug === item.slug);
          return product ? { item, product } : null;
        })
        .filter(Boolean) as Array<{ item: CartItem; product: Product }>,
    [items, products],
  );

  const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.item.quantity, 0);

  function persistCart(nextItems: CartItem[]) {
    window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    setItems(nextItems);
    window.dispatchEvent(new Event("atres:cart-changed"));
  }

  function updateQuantity(target: CartItem, quantity: number) {
    const nextQuantity = Math.max(1, Math.min(9, quantity));
    persistCart(
      items.map((item) =>
        item.slug === target.slug && item.color === target.color && item.size === target.size
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  }

  function removeItem(target: CartItem) {
    persistCart(
      items.filter(
        (item) =>
          !(item.slug === target.slug && item.color === target.color && item.size === target.size),
      ),
    );
  }

  function clearCart() {
    persistCart([]);
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black">Tu carrito esta vacio</h2>
        <p className="mt-2 text-sm font-semibold text-stone-500">
          Agrega productos desde el detalle para verlos aqui.
        </p>
        <Link href="/productos" className="mt-5 inline-flex bg-black px-5 py-3 text-sm font-black text-white">
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-3">
        {rows.map(({ item, product }) => (
          <article key={`${item.slug}-${item.color}-${item.size}`} className="grid grid-cols-[96px_1fr] gap-3 bg-white p-3 shadow-sm">
            <Link href={`/productos/${product.slug}`} className="relative aspect-square overflow-hidden bg-stone-100">
              <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" />
            </Link>
            <div className="min-w-0">
              <Link href={`/productos/${product.slug}`} className="line-clamp-2 text-base font-black">
                {product.name}
              </Link>
              <p className="mt-1 text-xs font-bold text-stone-500">
                {item.color} / {item.size}
              </p>
              <p className="mt-3 text-lg font-black text-orange-600">
                {formatCOP(product.price * item.quantity)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="grid grid-cols-[36px_44px_36px] bg-stone-100 text-center">
                  <button
                    type="button"
                    aria-label={`Reducir cantidad de ${product.name}`}
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    className="h-9 font-black"
                  >
                    -
                  </button>
                  <span className="flex h-9 items-center justify-center bg-white text-sm font-black">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Aumentar cantidad de ${product.name}`}
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                    className="h-9 font-black"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="h-9 bg-stone-100 px-3 text-xs font-black text-stone-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-black">Resumen</h2>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="text-sm font-bold text-stone-500">Subtotal</span>
          <span className="text-xl font-black">{formatCOP(subtotal)}</span>
        </div>
        <button className="mt-5 h-12 w-full bg-orange-600 text-sm font-black text-white">
          Continuar compra
        </button>
        <button onClick={clearCart} className="mt-3 h-11 w-full bg-stone-100 text-sm font-black text-stone-700">
          Vaciar carrito
        </button>
      </aside>
    </div>
  );
}
