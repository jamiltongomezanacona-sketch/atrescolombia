import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { StoreFooter } from "@/components/store-footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="store-surface flex min-h-screen flex-col overflow-x-hidden text-ink">
      <SkipLink />
      <SiteHeader />
      <div id="contenido-principal" className="flex flex-1 flex-col pb-24">
        {children}
      </div>
      <StoreFooter />
      <BottomNav />
    </div>
  );
}
