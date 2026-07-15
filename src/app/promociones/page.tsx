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
    <main className="store-surface min-h-screen overflow-x-hidden pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-6 sm:px-4 md:py-8">
        <div className="mb-5 overflow-hidden rounded-lg bg-[linear-gradient(135deg,#ffea61_0%,#fff7cc_54%,#ffffff_100%)] p-5 shadow-[0_24px_70px_rgba(164,117,0,0.12)] ring-1 ring-white/70">
          <p className="text-xs font-black uppercase text-stone-700">Ofertas ATRES</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Promociones</h1>
          <p className="mt-2 max-w-xl text-sm font-bold text-stone-700">
            Precios especiales, descuentos y productos seleccionados por temporada.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {promoProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
