import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getPublicNewProducts } from "@/lib/public-store";

export const metadata = {
  title: "Novedades | ATRES",
};

export default async function NewProductsPage() {
  const newProducts = await getPublicNewProducts();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="mb-5 bg-black p-5 text-white shadow-sm">
          <p className="text-xs font-black uppercase text-amber-200">Drop semanal</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Novedades</h1>
          <p className="mt-2 max-w-xl text-sm font-bold text-white/75">
            Nuevas prendas, colecciones frescas y piezas para descubrir primero.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {newProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
