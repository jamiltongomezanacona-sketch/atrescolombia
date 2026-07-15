import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { getPublicCategories, getPublicProducts } from "@/lib/public-store";
import Link from "next/link";

type SearchPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export const metadata = {
  title: "Buscar | ATRES",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q ?? "";
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? products.filter((product) =>
        [product.name, product.categoryName, product.collection, product.description, ...product.details]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
    : products;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="mb-5 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-stone-500">Busqueda</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            {query ? `Resultados para "${query}"` : "Busca productos ATRES"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-stone-500">
            {results.length} productos encontrados.
          </p>
        </div>
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {results.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black">No encontramos coincidencias</h2>
            <p className="mt-2 text-sm font-semibold text-stone-500">
              Prueba con una categoria, coleccion o prenda diferente.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="bg-stone-100 px-3 py-2 text-xs font-black text-stone-800"
                >
                  {category.shortName}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}
