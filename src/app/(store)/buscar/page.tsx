import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterDrawer } from "@/components/filter-drawer";
import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import {
  applyCatalogFilters,
  collectFilterOptions,
  parseCatalogFilters,
} from "@/lib/product-filters";
import { getPublicCategories, getPublicCategoriesForDisplay, getPublicProducts } from "@/lib/public-store";

export const metadata = {
  title: "Buscar",
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);
  const query = filters.q ?? "";

  const [products, categories, displayCategories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
    getPublicCategoriesForDisplay(),
  ]);

  const options = collectFilterOptions(products, categories);
  const results = query
    ? applyCatalogFilters(products, { ...filters, q: query }, categories)
    : [];

  return (
    <main>
      <section className="catalog-container py-6 md:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <PageHeader
            className="mb-0 flex-1"
            eyebrow="Resultados"
            title={query ? `Busqueda: ${query}` : "Buscar productos"}
            description={
              query
                ? `${results.length} resultado${results.length === 1 ? "" : "s"} para tu busqueda.`
                : "Escribe en la barra superior para encontrar prendas, categorias u ofertas."
            }
          />
          {query ? <FilterDrawer filters={filters} options={options} action="/buscar" /> : null}
        </div>

        {!query ? (
          <div className="space-y-4">
            <p className="text-sm font-normal text-stone-500">Categorias sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {displayCategories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="rounded-full bg-white px-4 py-2 text-xs font-medium text-stone-800 ring-1 ring-black/5 transition hover:bg-black hover:text-white"
                >
                  {category.shortName}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {query ? (
          results.length === 0 ? (
            <EmptyState
              title="No encontramos coincidencias"
              description="Prueba otra palabra o explora las categorias ATRES."
              actionHref="/categorias"
              actionLabel="Ver categorias"
            />
          ) : (
            <div className="catalog-grid">
              {results.map((product, index) => (
                <ProductCard key={product.slug} product={product} priority={index < 2} />
              ))}
            </div>
          )
        ) : null}
      </section>
    </main>
  );
}
