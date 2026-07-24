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
    <header className="store-header-shell text-white" aria-label="Cabecera ATRES">
      <div className="store-header-glass hidden border-b lg:block">
        <div className="header-container flex items-center justify-between gap-3 py-1.5 text-[11px] font-normal tracking-wide text-white/75">
          <span>100% producto colombiano</span>
          <span className="hidden md:inline">Compra por prenda o al por mayor</span>
          <Link href="/productos?ofertas=1" className="text-white/90 transition hover:text-gold-light">
            Ofertas y novedades
          </Link>
        </div>
      </div>

      <div className="header-container py-2 lg:py-2">
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-1.5 sm:gap-2 lg:grid-cols-[auto_minmax(0,1fr)_auto] xl:gap-3">
          <div className="flex shrink-0 items-center justify-start gap-1.5">
            <div className="lg:hidden">
              <Suspense fallback={<div className="h-10 w-10 rounded-[var(--radius-card)] bg-white/10" />}>
                <MobileNavDrawer items={navItems} />
              </Suspense>
            </div>
            <div className="hidden lg:block">
              <BrandLogo dark withWordmark />
            </div>
          </div>

          <div className="min-w-0 lg:justify-self-center lg:w-full lg:max-w-[28rem] xl:max-w-[32rem] 2xl:max-w-[36rem]">
            <Suspense fallback={<div className="h-10 rounded-[var(--radius-card)] bg-white/10 lg:hidden" />}>
              <HeaderMobileSearch />
            </Suspense>
            <SearchBox
              className="hidden min-w-0 w-full lg:block"
              placeholder="Buscar vestidos, jeans, pijamas..."
            />
          </div>

          <div className="flex shrink-0 items-center justify-end">
            <HeaderActions compact minimal />
            <HeaderActions />
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <Suspense fallback={<div className="store-header-nav h-7" />}>
          <HeaderNav items={navItems} />
        </Suspense>
      </div>
    </header>
  );
}
