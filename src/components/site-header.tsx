import Link from "next/link";
import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderActions } from "@/components/header-actions";
import { HeaderMobileSearch } from "@/components/header-mobile-search";
import { HeaderNav } from "@/components/header-nav";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { SearchBox } from "@/components/search-box";
import { getStoreNavigation } from "@/lib/public-store";

export async function SiteHeader() {
  const navItems = await getStoreNavigation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-[#080808]/96 text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)] backdrop-blur-xl lg:sticky">
      <div className="hidden border-b border-white/10 bg-white/[0.045] lg:block">
        <div className="catalog-container flex items-center justify-between gap-3 py-1.5 text-[11px] font-normal text-white/70">
          <span>100% producto colombiano</span>
          <span className="hidden md:inline">Compra por prenda o al por mayor</span>
          <Link href="/ofertas" className="text-amber-200 transition hover:text-white">
            Ofertas activas y novedades ATRES
          </Link>
        </div>
      </div>

      <div className="catalog-container py-1.5 lg:py-2.5">
        <div className="flex items-center gap-2 lg:grid lg:grid-cols-[230px_minmax(360px,1fr)_360px] lg:gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <MobileNavDrawer items={navItems} />
            <BrandLogo dark compact />
          </div>

          <SearchBox
            className="hidden w-full max-w-4xl lg:mx-auto lg:block"
            placeholder="Buscar vestidos, jeans, pijamas, uniformes..."
          />

          <div className="ml-auto flex items-center gap-1">
            <HeaderActions compact />
            <HeaderActions />
          </div>
        </div>

        <Suspense fallback={<div className="mt-1.5 h-10 rounded-full bg-white/12 lg:hidden" />}>
          <HeaderMobileSearch />
        </Suspense>
      </div>

      <div className="hidden lg:block">
        <HeaderNav items={navItems} />
      </div>
    </header>
  );
}
