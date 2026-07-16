"use client";

import { usePathname } from "next/navigation";

export function HeaderMobileSearch() {
  const pathname = usePathname();

  if (pathname === "/productos" || pathname.startsWith("/productos?")) {
    return null;
  }

  return (
    <form
      action="/buscar"
      className="mt-1.5 flex h-9 w-full overflow-hidden rounded-full bg-white/94 text-black shadow-sm ring-1 ring-white/20 lg:hidden"
    >
      <input
        name="q"
        aria-label="Buscar productos"
        placeholder="Buscar ropa ATRES..."
        className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold placeholder:text-stone-400"
      />
      <button
        className="inline-flex h-9 w-11 items-center justify-center bg-white/70 text-black ring-1 ring-black/10"
        type="submit"
        aria-label="Buscar"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

function SearchIcon() {
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
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}
