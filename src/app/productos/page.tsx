import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getPublicCategories, getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Productos | ATRES",
  description: "Catalogo completo de moda ATRES.",
};

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-stone-500">Catalogo ATRES</p>
            <h1 className="text-3xl font-black tracking-tight">Todos los productos</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {categories.slice(0, 6).map((category) => (
              <Link key={category.slug} href={`/categoria/${category.slug}`} className="shrink-0 bg-white px-3 py-2 text-xs font-black">
                {category.shortName}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
