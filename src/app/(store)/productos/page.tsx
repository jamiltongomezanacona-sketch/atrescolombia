import Link from "next/link";
import { CatalogFiltersForm } from "@/components/catalog-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterDrawer } from "@/components/filter-drawer";
import { ProductCard } from "@/components/product-card";
import {
  applyCatalogFilters,
  buildCatalogQuery,
  collectFilterOptions,
  countActiveFilters,
  parseCatalogFilters,
  type CatalogFilterState,
} from "@/lib/product-filters";
import {
  getPublicCategories,
  getPublicCategoriesForDisplay,
  getPublicProducts,
} from "@/lib/public-store";
import { normalizeNavSlug } from "@/lib/store-navigation";

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
  const [products, categories, displayCategories] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
    getPublicCategoriesForDisplay(),
  ]);

  const options = collectFilterOptions(products, categories);
  const filteredProducts = applyCatalogFilters(products, filters, categories);
  const activeFilters = countActiveFilters(filters);
  const activeCategory = filters.categoria
    ? displayCategories.find(
        (category) => normalizeNavSlug(category.slug) === normalizeNavSlug(filters.categoria ?? ""),
      )
    : null;
  const pageTitle = activeCategory?.shortName ?? (filters.ofertas ? "Ofertas" : filters.novedades ? "Novedades" : "Productos");

  const orderLinks = [
    { label: "Para ti", value: "relevancia" },
    { label: "Tendencias", value: "tendencias" },
    { label: "Nuevos", value: "nuevos" },
    { label: "Menor precio", value: "precio-menor" },
    { label: "Mayor precio", value: "precio-mayor" },
    { label: "Mayor descuento", value: "descuento" },
  ];
  const categoryTabs = [
    {
      label: "Todo",
      href: buildCatalogQuery(clearDepartmentFilters(filters)),
      active: !filters.categoria && !filters.ofertas && !filters.novedades,
    },
    ...displayCategories.map((category) => ({
      label: category.shortName,
      href: buildCatalogQuery({
        ...filters,
        categoria: category.slug,
        ofertas: false,
        novedades: false,
      }),
      active:
        Boolean(filters.categoria) &&
        normalizeNavSlug(filters.categoria ?? "") === normalizeNavSlug(category.slug),
    })),
    {
      label: "Ofertas",
      href: buildCatalogQuery({
        ...filters,
        categoria: undefined,
        ofertas: true,
        novedades: false,
      }),
      active: Boolean(filters.ofertas),
    },
  ];

  return (
    <main>
      <section className="catalog-container pb-3 pt-2 md:py-3">
        <nav className="mb-1 hidden text-xs font-normal text-stone-400 md:block" aria-label="Ruta de navegacion">
          <Link href="/" className="hover:text-black">
            Inicio
          </Link>
          <span className="mx-2 text-stone-300">/</span>
          <span className="text-stone-700">Productos</span>
          {activeCategory ? (
            <>
              <span className="mx-2 text-stone-300">/</span>
              <span className="text-stone-700">{activeCategory.shortName}</span>
            </>
          ) : null}
        </nav>

        <div className="sr-only md:not-sr-only md:mb-2 md:flex md:items-end md:justify-between md:gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            {pageTitle}
          </h1>
          <p className="hidden text-sm font-normal text-stone-500 md:block">
            {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="sticky top-[6.85rem] z-30 -mx-3 mb-2 border-y border-black/5 bg-background/95 px-3 py-1.5 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border sm:bg-white/88 sm:shadow-soft lg:top-[7.25rem] lg:static lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:backdrop-blur-none">
          <nav className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" aria-label="Departamentos del catalogo">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-medium transition ${
                  tab.active
                    ? "bg-black !text-white shadow-sm"
                    : "bg-white text-stone-700 ring-1 ring-black/5 hover:bg-stone-100"
                }`}
              >
                <span className="text-current">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-4">
          <aside className="sticky top-[8.25rem] hidden max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-white/88 p-3 shadow-soft ring-1 ring-black/5 lg:block">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium text-brand">Filtros</p>
                <p className="text-sm font-medium text-ink">Refina tu busqueda</p>
              </div>
              {activeFilters > 0 ? (
                <span className="rounded-full bg-black px-2 py-1 text-[10px] font-medium text-white">
                  {activeFilters}
                </span>
              ) : null}
            </div>
            <CatalogFiltersForm filters={filters} options={options} idPrefix="desktop-filter" />
          </aside>

          <div className="min-w-0">
            <div className="mb-1.5 grid gap-1.5 rounded-lg bg-white/88 p-1.5 shadow-sm ring-1 ring-black/5 sm:mb-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:rounded-xl sm:p-2">
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <p className="text-sm font-medium text-stone-700">
                  {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                  {activeFilters > 0 ? (
                    <span className="ml-2 text-xs font-normal text-stone-500">
                      {activeFilters} filtro{activeFilters === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </p>
                <div className="lg:hidden">
                  <FilterDrawer filters={filters} options={options} />
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0">
                <span className="hidden shrink-0 items-center px-1 text-[11px] font-medium text-stone-400 md:inline-flex">
                  Ordenar
                </span>
                {orderLinks.map((link) => {
                  const active = (filters.orden ?? "relevancia") === link.value;
                  return (
                    <Link
                      key={link.value}
                      href={buildCatalogQuery({ ...filters, orden: link.value })}
                      className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition sm:px-3 sm:text-xs ${
                        active
                          ? "bg-black !text-white shadow-sm"
                          : "bg-white/75 text-stone-700 ring-1 ring-black/5 hover:bg-white"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="text-current">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                description="Prueba quitando algunos filtros o explora todo el catalogo ATRES."
                actionHref="/productos"
                actionLabel="Ver todo"
              />
            ) : (
              <div className="catalog-grid-with-sidebar">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.slug} product={product} priority={index < 6} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function clearDepartmentFilters(filters: CatalogFilterState): CatalogFilterState {
  return {
    ...filters,
    categoria: undefined,
    ofertas: false,
    novedades: false,
  };
}
