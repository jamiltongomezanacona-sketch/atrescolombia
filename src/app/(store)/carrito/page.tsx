import { CartView } from "@/components/cart-view";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Carrito | ATRES",
};

export default async function CartPage() {
  const products = await getPublicProducts();

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader eyebrow="Tu compra" title="Carrito" />
        <CartView products={products} />
      </section>
    </main>
  );
}
