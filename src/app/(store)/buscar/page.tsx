import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicCategories, getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Buscar | ATRES",
};

type SearchPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim();
  const [products, categories] = await Promise.all([getPublicProducts(), getPublicCategories()]);
  const normalized = query.toLowerCase();
  const results = normalized
    ? products.filter((product) =>
        [product.name, product.categoryName, product.collection, product.description, ...product.details]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
    : [];

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader
          eyebrow="Resultados"
          title={query ? `Busqueda: ${query}` : "Buscar productos"}
          description={
            query
              ? `${results.length} resultado${results.length === 1 ? "" : "s"} para tu busqueda.`
              : "Escribe en la barra superior para encontrar prendas, categorias u ofertas."
          }
        />

        {query && results.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-stone-500">No encontramos coincidencias. Prueba una categoria:</p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="rounded-full bg-white px-4 py-2 text-xs font-black text-stone-800 ring-1 ring-black/5 transition hover:bg-black hover:text-white"
                >
                  {category.shortName}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {results.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
