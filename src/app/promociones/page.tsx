import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getPublicPromoProducts } from "@/lib/public-store";

export const metadata = {
  title: "Promociones | ATRES",
};

export default async function PromosPage() {
  const promoProducts = await getPublicPromoProducts();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="mb-5 bg-[#ffea61] p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-stone-700">Ofertas ATRES</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Promociones</h1>
          <p className="mt-2 max-w-xl text-sm font-bold text-stone-700">
            Precios especiales, descuentos y productos seleccionados por temporada.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {promoProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
