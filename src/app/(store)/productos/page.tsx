import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterDrawer } from "@/components/filter-drawer";
import { ProductCard } from "@/components/product-card";
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
  const [products, categories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
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
      <section className="catalog-container py-2 lg:py-3">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-black uppercase text-brand lg:text-xs">Catalogo ATRES</p>
            <h1 className="mt-0.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">Todos los productos</h1>
            <p className="mt-2 hidden max-w-2xl text-sm font-semibold leading-6 text-stone-600 sm:block">
              Filtra por categoria, talla, color, oferta y disponibilidad con los datos reales del catalogo.
            </p>
          </div>
        </div>

        <div>
            <GlassPanel className="mb-3 grid gap-2 px-2.5 py-2.5 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-3 sm:py-2.5">
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <p className="text-sm font-black text-stone-700">
                  {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                </p>
                <FilterDrawer filters={filters} options={options} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0">
                {orderLinks.map((link) => {
                  const active = (filters.orden ?? "relevancia") === link.value;
                  return (
                    <Link
                      key={link.value}
                      href={buildCatalogQuery({ ...filters, orden: link.value })}
                      className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${
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
              <div className="catalog-grid">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.slug} product={product} priority={index < 2} />
                ))}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}
