"use client";

import { useEffect, useState } from "react";

type FavoriteButtonProps = {
  productSlug: string;
  compact?: boolean;
  label?: string;
  activeLabel?: string;
};

const FAVORITES_KEY = "atres:favorites";

function readFavorites() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

export function FavoriteButton({
  productSlug,
  compact = false,
  label = "Agregar a favoritos",
  activeLabel = "Quitar de favoritos",
}: FavoriteButtonProps) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setActive(readFavorites().has(productSlug)));
  }, [productSlug]);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const favorites = readFavorites();

    if (favorites.has(productSlug)) {
      favorites.delete(productSlug);
      setActive(false);
    } else {
      favorites.add(productSlug);
      setActive(true);
    }

    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    window.dispatchEvent(new Event("atres:favorites-changed"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? activeLabel : label}
      className={
        compact
          ? "bg-white/95 px-2 py-1 text-xs font-black text-black shadow-sm"
          : "h-11 bg-white px-4 text-sm font-black text-black shadow-sm ring-1 ring-black/10 transition hover:bg-amber-200"
      }
    >
      {active ? "Fav" : compact ? "+Fav" : label}
    </button>
  );
}
