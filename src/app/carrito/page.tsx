import { BottomNav } from "@/components/bottom-nav";
import { CartView } from "@/components/cart-view";
import { SiteHeader } from "@/components/site-header";
import { getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Carrito | ATRES",
};

export default async function CartPage() {
  const products = await getPublicProducts();

  return (
    <main className="store-surface min-h-screen overflow-x-hidden pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-6 sm:px-4 md:py-8">
        <div className="glass-surface mb-5 rounded-lg p-5 ring-1 ring-white/65">
          <p className="text-xs font-black uppercase text-stone-500">Tu compra</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Carrito</h1>
        </div>
        <CartView products={products} />
      </section>
      <BottomNav />
    </main>
  );
}
