"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  quantity: number;
};

type HeaderActionsProps = {
  compact?: boolean;
};

function readCount() {
  try {
    const items = JSON.parse(window.localStorage.getItem("atres:cart") ?? "[]") as CartItem[];
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

export function HeaderActions({ compact = false }: HeaderActionsProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncCount() {
      queueMicrotask(() => setCount(readCount()));
    }

    syncCount();
    window.addEventListener("atres:cart-changed", syncCount);
    window.addEventListener("storage", syncCount);

    return () => {
      window.removeEventListener("atres:cart-changed", syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  if (compact) {
    return (
      <nav className="flex items-center justify-end gap-1 md:hidden" aria-label="Acciones rapidas">
        <Link
          href="/favoritos"
          aria-label="Favoritos"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
        >
          <HeaderIcon type="heart" />
        </Link>
        <Link
          href="/carrito"
          aria-label={count > 0 ? `Carrito, ${count} productos` : "Carrito"}
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
        >
          <HeaderIcon type="bag" />
          {count > 0 ? (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-black text-white">
              {count}
            </span>
          ) : null}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="hidden items-center justify-end gap-2 text-sm font-black md:flex" aria-label="Acciones">
      <Link
        href="/favoritos"
        className="inline-flex h-11 items-center gap-2 rounded-full px-3 text-white/90 transition hover:bg-white/10 hover:text-white"
      >
        <HeaderIcon type="heart" />
        Favoritos
      </Link>
      <Link
        href="/carrito"
        className="relative inline-flex h-11 items-center gap-2 rounded-full px-3 text-white/90 transition hover:bg-white/10 hover:text-white"
      >
        <HeaderIcon type="bag" />
        Carrito
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-black text-white">
            {count}
          </span>
        ) : null}
      </Link>
      <Link
        href="/ofertas"
        className="inline-flex h-11 items-center rounded-full bg-white px-3 text-black transition hover:bg-amber-100"
      >
        Ofertas
      </Link>
    </nav>
  );
}

function HeaderIcon({ type }: { type: "heart" | "bag" }) {
  if (type === "heart") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 fill-none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8h12l-1 13H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </svg>
  );
}
