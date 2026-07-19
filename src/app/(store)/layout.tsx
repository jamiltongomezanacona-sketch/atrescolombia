import { BottomNav } from "@/components/bottom-nav";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { StoreFooter } from "@/components/store-footer";
import { getPublicStoreSettings } from "@/lib/public-settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicStoreSettings();

  return (
    <div
      className="store-surface flex min-h-screen flex-col overflow-x-hidden text-ink"
      data-atres-whatsapp={settings?.whatsapp || undefined}
    >
      <SkipLink />
      <SiteHeader />
      <div
        id="contenido-principal"
        className="flex flex-1 flex-col pt-[6.85rem] pb-[calc(7.25rem+env(safe-area-inset-bottom))] md:pb-0 lg:pt-0"
      >
        {children}
      </div>
      <StoreFooter />
      <FloatingWhatsApp />
      <BottomNav />
    </div>
  );
}
