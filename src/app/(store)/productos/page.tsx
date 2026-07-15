import Link from "next/link";
import { CatalogFiltersForm } from "@/components/catalog-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterDrawer } from "@/components/filter-drawer";
import { ProductCard } from "@/components/product-card";
import { QuickFilters } from "@/components/quick-filters";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  applyCatalogFilters,
  buildCatalogQuery,
  collectFilterOptions,
  parseCatalogFilters,
} from "@/lib/product-filters";
import {
  getPublicCategories,
  getPublicProducts,
  getStoreNavigation,
} from "@/lib/public-store";

export const metadata = {
  title: "Productos | ATRES",
  description: "Catalogo completo de moda ATRES.",
};

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);
  const [products, categories, navItems] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
    getStoreNavigation(),
  ]);

  const options = collectFilterOptions(products, categories);
  const filteredProducts = applyCatalogFilters(products, filters, categories);

  const orderLinks = [
    { label: "Relevancia", value: "relevancia" },
    { label: "Tendencias", value: "tendencias" },
    { label: "Nuevos", value: "nuevos" },
    { label: "Menor precio", value: "precio-menor" },
    { label: "Mayor precio", value: "precio-mayor" },
    { label: "Mayor descuento", value: "descuento" },
  ];

  return (
    <main>
      <section className="border-b border-white/70 bg-white/70">
        <div className="store-container grid gap-2 py-3 text-xs font-black uppercase text-stone-600 sm:grid-cols-3">
          <p>Compra facil y segura</p>
          <p className="sm:text-center">Nuevas colecciones ATRES</p>
          <p className="sm:text-right">Precios directos de temporada</p>
        </div>
      </section>

      <section className="border-b border-black/5 bg-white/55 py-3">
        <QuickFilters items={navItems} />
      </section>

      <section className="store-container py-6 md:py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-brand">Catalogo ATRES</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink md:text-4xl">Todos los productos</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
              Filtra por categoria, talla, color, oferta y disponibilidad con los datos reales del catalogo.
            </p>
          </div>
          <FilterDrawer filters={filters} options={options} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <GlassPanel className="sticky top-28 p-4">
              <p className="mb-4 text-sm font-black text-ink">Filtros</p>
              <CatalogFiltersForm
                filters={filters}
                options={options}
                idPrefix="desktop-filter"
              />
            </GlassPanel>
          </aside>

          <div>
            <GlassPanel className="mb-5 flex flex-wrap items-center justify-between gap-3 px-3 py-3">
              <p className="text-sm font-black text-stone-700">
                {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap gap-2">
                {orderLinks.map((link) => {
                  const active = (filters.orden ?? "relevancia") === link.value;
                  return (
                    <Link
                      key={link.value}
                      href={buildCatalogQuery({ ...filters, orden: link.value })}
                      className={`rounded-full px-3 py-2 text-xs font-black transition ${
                        active
                          ? "bg-black text-white shadow-sm"
                          : "bg-white/70 text-stone-700 ring-1 ring-black/5 hover:bg-white"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </GlassPanel>

            {filteredProducts.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                description="Prueba quitando algunos filtros o explora todo el catalogo ATRES."
                actionHref="/productos"
                actionLabel="Ver todo"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.slug} product={product} priority={index < 2} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
