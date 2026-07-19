import { CartView } from "@/components/cart-view";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicStoreSettings } from "@/lib/public-settings";
import { getPublicProducts } from "@/lib/public-store";
import { resolveStoreWhatsapp } from "@/lib/whatsapp";

export const metadata = {
  title: "Carrito",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const [products, settings] = await Promise.all([getPublicProducts(), getPublicStoreSettings()]);

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader eyebrow="Tu compra" title="Carrito" />
        <CartView products={products} whatsapp={resolveStoreWhatsapp(settings?.whatsapp)} />
      </section>
    </main>
  );
}
