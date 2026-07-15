"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  quantity: number;
};

function readCount() {
  try {
    const items = JSON.parse(window.localStorage.getItem("atres:cart") ?? "[]") as CartItem[];
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

export function HeaderActions() {
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

  return (
    <nav className="hidden items-center justify-end gap-4 text-sm font-black md:flex">
      <Link href="/favoritos">Favoritos</Link>
      <Link href="/carrito" className="relative">
        Carrito
        {count > 0 ? (
          <span className="absolute -right-4 -top-3 flex h-5 min-w-5 items-center justify-center bg-orange-600 px-1 text-[10px] font-black text-white">
            {count}
          </span>
        ) : null}
      </Link>
      <Link href="/ofertas">Ofertas</Link>
    </nav>
  );
}
