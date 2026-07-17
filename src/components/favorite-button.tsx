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
          ? "grid size-9 place-items-center rounded-full bg-white/95 text-black shadow-sm ring-1 ring-black/10 transition hover:scale-105 hover:bg-white"
          : "inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black shadow-sm ring-1 ring-black/10 transition hover:bg-amber-100"
      }
    >
      <HeartIcon filled={active} />
      {compact ? <span className="sr-only">{active ? activeLabel : label}</span> : <span>{active ? activeLabel : label}</span>}
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`size-5 ${filled ? "fill-red-600 text-red-600" : "fill-none text-black"}`}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
