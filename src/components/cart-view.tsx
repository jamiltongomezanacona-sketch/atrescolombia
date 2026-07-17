"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ProductPrice } from "@/components/ui/product-price";
import { buildCartWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { formatCOP, type Product } from "@/lib/store-data";

type CartItem = {
  slug: string;
  quantity: number;
  color: string;
  size: string;
};

type CartViewProps = {
  products: Product[];
  whatsapp?: string;
};

const CART_KEY = "atres:cart";

function readCart() {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

export function CartView({ products, whatsapp }: CartViewProps) {
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

  const whatsappUrl =
    whatsapp && rows.length
      ? buildWhatsAppUrl(
          whatsapp,
          buildCartWhatsAppMessage(
            rows.map(({ item, product }) => ({
              name: product.name,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
              price: product.price,
            })),
            subtotal,
          ),
        )
      : null;

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
        (item) => !(item.slug === target.slug && item.color === target.color && item.size === target.size),
      ),
    );
  }

  function clearCart() {
    persistCart([]);
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Tu carrito esta vacio"
        description="Agrega productos desde el detalle para verlos aqui."
        actionHref="/productos"
        actionLabel="Explorar productos"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-3" role="status" aria-live="polite">
        {rows.map(({ item, product }) => (
          <article
            key={`${item.slug}-${item.color}-${item.size}`}
            className="grid grid-cols-[96px_1fr] gap-3 rounded-lg bg-white/85 p-3 shadow-soft ring-1 ring-white/65"
          >
            <Link
              href={`/productos/${product.slug}`}
              className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted"
            >
              <Image src={product.image} alt={product.name} fill sizes="96px" className="object-cover" />
            </Link>
            <div className="min-w-0">
              <Link href={`/productos/${product.slug}`} className="line-clamp-2 text-base font-medium text-ink">
                {product.name}
              </Link>
              <p className="mt-1 text-xs font-normal text-stone-500">
                {item.color} / {item.size}
              </p>
              <ProductPrice price={product.price * item.quantity} className="mt-3" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="grid grid-cols-[36px_44px_36px] overflow-hidden rounded-full bg-stone-100 text-center">
                  <button
                    type="button"
                    aria-label={`Reducir cantidad de ${product.name}`}
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    className="h-11 min-w-9 font-medium"
                  >
                    -
                  </button>
                  <span className="flex h-11 items-center justify-center bg-white text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Aumentar cantidad de ${product.name}`}
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                    className="h-11 min-w-9 font-medium"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  className="h-11 rounded-full bg-stone-100 px-3 text-xs font-medium text-stone-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <GlassPanel as="aside" className="p-5">
        <h2 className="text-2xl font-medium text-ink">Resumen</h2>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="text-sm font-normal text-stone-500">Subtotal</span>
          <span className="text-xl font-medium">{formatCOP(subtotal)}</span>
        </div>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#25D366] px-4 text-sm font-medium text-white transition hover:bg-[#1ebe57]"
          >
            Continuar por WhatsApp
          </a>
        ) : (
          <Button variant="brand" size="lg" className="mt-5" href="/productos">
            Seguir comprando
          </Button>
        )}
        <Button variant="secondary" size="lg" className="mt-3 rounded-full" onClick={clearCart}>
          Vaciar carrito
        </Button>
      </GlassPanel>
    </div>
  );
}
