import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderActions } from "@/components/header-actions";
import { getPublicCategories } from "@/lib/public-store";

export async function SiteHeader() {
  const categories = await getPublicCategories();

  return (
    <header className="sticky top-0 z-40 bg-black/95 text-white shadow-[0_14px_45px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/[0.04]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white/75 sm:px-4">
          <span>Envios a toda Colombia</span>
          <span className="hidden sm:inline">Nuevas prendas cada semana</span>
          <Link href="/ofertas" className="text-amber-200 hover:text-white">
            Ofertas activas
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1500px] items-center gap-3 px-3 py-3 sm:px-4 md:grid-cols-[220px_1fr_300px]">
        <BrandLogo dark compact />
        <form action="/buscar" className="mx-auto flex h-11 w-full max-w-3xl overflow-hidden rounded-full bg-white/94 text-black shadow-[0_12px_35px_rgba(0,0,0,0.18)] ring-1 ring-white/25 backdrop-blur">
          <input
            name="q"
            aria-label="Buscar productos"
            placeholder="Buscar vestidos, jeans, pijamas..."
            className="min-w-0 flex-1 px-5 text-sm font-semibold outline-none placeholder:text-stone-400"
          />
          <button className="inline-flex w-14 items-center justify-center bg-white/70 text-black ring-1 ring-black/10 transition hover:bg-amber-100 sm:w-28 sm:gap-2" type="submit">
            <SearchIcon />
            <span className="hidden text-sm font-black sm:inline">Buscar</span>
          </button>
        </form>
        <HeaderActions />
      </div>
      <nav className="border-t border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-[1500px] gap-1.5 overflow-x-auto px-3 py-2 text-sm font-bold [scrollbar-width:none] sm:px-4">
          <Link href="/productos" className="shrink-0 rounded-full px-3 py-2 text-white/95 transition hover:bg-white/10 hover:text-white">
            Todo
          </Link>
          <Link href="/novedades" className="shrink-0 rounded-full px-3 py-2 text-white/95 transition hover:bg-white/10 hover:text-white">
            Novedades
          </Link>
          <Link href="/ofertas" className="shrink-0 rounded-full px-3 py-2 text-white/95 transition hover:bg-white/10 hover:text-white">
            Ofertas
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categoria/${category.slug}`}
              className="shrink-0 rounded-full px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {category.shortName}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}
