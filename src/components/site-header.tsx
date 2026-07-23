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
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 text-white shadow-soft backdrop-blur-xl lg:sticky lg:border-b-0 lg:shadow-none"
      aria-label="Cabecera ATRES"
    >
      <div className="hidden border-b border-white/10 bg-white/[0.03] lg:block">
        <div className="header-container flex items-center justify-between gap-2 py-0.5 text-[11px] font-normal tracking-wide text-white/70">
          <span>100% producto colombiano</span>
          <span className="hidden md:inline">Compra por prenda o al por mayor</span>          <Link href="/ofertas" className="text-white/85 transition hover:text-white">
            Ofertas y novedades
          </Link>
        </div>
      </div>

      <div className="header-container py-1.5 lg:py-1">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 xl:gap-3">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="lg:hidden">
              <Suspense fallback={<div className="h-8 w-8 rounded-[var(--radius-card)] bg-white/10" />}>
                <MobileNavDrawer items={navItems} />
              </Suspense>
            </div>
            <div className="hidden lg:block">
              <BrandLogo dark withWordmark />
            </div>
          </div>

          <div className="min-w-0 lg:justify-self-center lg:w-full lg:max-w-[28rem] xl:max-w-[32rem] 2xl:max-w-[36rem]">
            <Suspense fallback={<div className="h-9 rounded-[var(--radius-card)] bg-white/10 lg:hidden" />}>
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
        <Suspense fallback={<div className="h-7 border-t border-white/10 bg-white/[0.03]" />}>
          <HeaderNav items={navItems} />
        </Suspense>
      </div>
    </header>
  );
}
