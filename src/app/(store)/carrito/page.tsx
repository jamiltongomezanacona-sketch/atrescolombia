import { CartView } from "@/components/cart-view";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicStoreSettings } from "@/lib/public-settings";
import { resolveStoreWhatsapp } from "@/lib/whatsapp";

export const metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const settings = await getPublicStoreSettings();

  return (
    <main>
      <section className="store-container py-3 md:py-4">
        <PageHeader eyebrow="Tu compra" title="Carrito" />
        <CartView whatsapp={resolveStoreWhatsapp(settings?.whatsapp)} />
      </section>
    </main>
  );
}
