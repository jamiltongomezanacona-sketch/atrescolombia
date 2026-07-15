import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderActions } from "@/components/header-actions";
import { HeaderNav } from "@/components/header-nav";
import { getPublicCategories } from "@/lib/public-store";

export async function SiteHeader() {
  const categories = await getPublicCategories();

  return (
    <header className="sticky top-0 z-40 bg-black/95 text-white shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
      <div className="border-b border-white/10 bg-white/[0.04]">
        <div className="store-container flex items-center justify-between gap-3 py-2 text-[11px] font-black uppercase tracking-wide text-white/75">
          <span>Envios a toda Colombia</span>
          <span className="hidden sm:inline">Nuevas prendas cada semana</span>
          <Link href="/ofertas" className="text-amber-200 hover:text-white">
            Ofertas activas
          </Link>
        </div>
      </div>
      <div className="store-container grid items-center gap-3 py-3 md:grid-cols-[220px_1fr_300px]">
        <BrandLogo dark compact />
        <form
          action="/buscar"
          className="mx-auto flex h-11 w-full max-w-3xl overflow-hidden rounded-full bg-white/94 text-black shadow-soft ring-1 ring-white/25"
        >
          <input
            name="q"
            aria-label="Buscar productos"
            placeholder="Buscar vestidos, jeans, pijamas..."
            className="min-w-0 flex-1 bg-transparent px-5 text-sm font-semibold placeholder:text-stone-400"
          />
          <button
            className="inline-flex w-14 items-center justify-center bg-white/70 text-black ring-1 ring-black/10 transition hover:bg-amber-100 sm:w-28 sm:gap-2"
            type="submit"
            aria-label="Buscar"
          >
            <SearchIcon />
            <span className="hidden text-sm font-black sm:inline">Buscar</span>
          </button>
        </form>
        <HeaderActions />
      </div>
      <HeaderNav categories={categories} />
    </header>
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
