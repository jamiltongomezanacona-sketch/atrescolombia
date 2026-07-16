import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderActions } from "@/components/header-actions";
import { HeaderNav } from "@/components/header-nav";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { getStoreNavigation } from "@/lib/public-store";

export async function SiteHeader() {
  const navItems = await getStoreNavigation();

  return (
    <header className="sticky top-0 z-40 bg-[#080808]/96 text-white shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="hidden border-b border-white/10 bg-white/[0.04] lg:block">
        <div className="catalog-container flex items-center justify-between gap-3 py-2 text-[11px] font-black uppercase tracking-wide text-white/75">
          <span>100% producto colombiano</span>
          <span className="hidden md:inline">Del taller al cliente</span>
          <Link href="/ofertas" className="text-amber-200 hover:text-white">
            Contacto por prenda o al por mayor
          </Link>
        </div>
      </div>

      <div className="catalog-container py-1.5 lg:py-3">
        <div className="flex items-center gap-2 lg:grid lg:grid-cols-[220px_1fr_300px] lg:gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <MobileNavDrawer items={navItems} />
            <BrandLogo dark compact />
          </div>

          <form
            action="/buscar"
            className="hidden h-11 w-full max-w-3xl overflow-hidden rounded-full bg-white/94 text-black shadow-soft ring-1 ring-white/25 lg:mx-auto lg:flex"
          >
            <input
              name="q"
              aria-label="Buscar productos"
              placeholder="Buscar vestidos, jeans, pijamas..."
              className="min-w-0 flex-1 bg-transparent px-5 text-sm font-semibold placeholder:text-stone-400"
            />
            <button
              className="inline-flex min-w-14 items-center justify-center bg-white/70 px-3 text-black ring-1 ring-black/10 transition hover:bg-amber-100 sm:min-w-28 sm:gap-2"
              type="submit"
              aria-label="Buscar"
            >
              <SearchIcon />
              <span className="hidden text-sm font-black sm:inline">Buscar</span>
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1">
            <HeaderActions compact />
            <HeaderActions />
          </div>
        </div>

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
      </div>

      <div className="hidden lg:block">
        <HeaderNav items={navItems} />
      </div>
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
