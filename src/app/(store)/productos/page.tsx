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
  title: "Productos",
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
      <section className="catalog-container products-catalog-container pb-4 pt-1 md:pb-5 md:pt-2 lg:pb-6 lg:pt-2">
        <nav className="mb-1.5 hidden text-xs font-normal text-ink-muted md:block" aria-label="Ruta de navegacion">
          <Link href="/" className="hover:text-ink">
            Inicio
          </Link>
          <span className="mx-2 text-stone-300">/</span>
          <span className="text-ink">Productos</span>
          {activeCategory ? (
            <>
              <span className="mx-2 text-stone-300">/</span>
              <span className="text-ink">{activeCategory.shortName}</span>
            </>
          ) : null}
        </nav>

        <div className="sr-only md:not-sr-only md:mb-3 md:flex md:items-end md:justify-between md:gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-ink sm:text-[1.7rem] lg:text-[1.85rem]">
            {pageTitle}
          </h1>
          <p className="hidden text-sm font-normal text-ink-muted md:block lg:hidden">
            {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="sticky top-[3.5rem] z-30 -mx-4 mb-3 border-y border-black/[0.06] bg-background/95 px-4 py-2 backdrop-blur-xl sm:mx-0 sm:rounded-[var(--radius-card)] sm:border sm:bg-surface/90 sm:shadow-soft lg:static lg:mb-3 lg:border-none lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none lg:backdrop-blur-none">
          <nav
            className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] lg:gap-1.5 [&::-webkit-scrollbar]:hidden"
            aria-label="Departamentos del catalogo"
          >
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex h-9 shrink-0 items-center rounded-[var(--radius-card)] px-3 text-xs font-medium transition sm:h-9 sm:text-sm lg:h-8 lg:px-3 lg:text-[13px] ${
                  tab.active
                    ? "bg-ink text-white"
                    : "bg-surface text-ink-muted ring-1 ring-black/8 hover:bg-surface-muted hover:text-ink"
                }`}
              >
                <span className="text-current">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start lg:gap-4 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-5">
          <aside className="sticky top-[6.75rem] hidden max-h-[calc(100vh-7.25rem)] overflow-y-auto border-r border-black/[0.06] pr-4 lg:block">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-brand">Filtros</p>
                <p className="mt-0.5 text-sm font-medium text-ink">Refina</p>
              </div>
              {activeFilters > 0 ? (
                <span className="rounded-[var(--radius-card)] bg-ink px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {activeFilters}
                </span>
              ) : null}
            </div>
            <CatalogFiltersForm
              filters={filters}
              options={options}
              idPrefix="desktop-filter"
              className="lg:gap-2.5"
            />
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-2.5 sm:mb-3.5">
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <p className="text-sm font-medium text-ink-muted">
                  {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                  {activeFilters > 0 ? (
                    <span className="ml-2 text-xs font-normal text-ink-muted/80">
                      {activeFilters} filtro{activeFilters === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </p>
                <div className="lg:hidden">
                  <FilterDrawer filters={filters} options={options} />
                </div>
              </div>
              <div className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0">
                <span className="hidden h-8 shrink-0 items-center px-1 text-[11px] font-medium text-ink-muted md:inline-flex">
                  Ordenar
                </span>
                {orderLinks.map((link) => {
                  const active = (filters.orden ?? "relevancia") === link.value;
                  return (
                    <Link
                      key={link.value}
                      href={buildCatalogQuery({ ...filters, orden: link.value })}
                      className={`inline-flex h-8 shrink-0 items-center rounded-[var(--radius-card)] px-2.5 text-[11px] font-medium transition sm:px-3 sm:text-xs ${
                        active
                          ? "bg-ink text-white"
                          : "bg-transparent text-ink-muted ring-1 ring-black/8 hover:bg-surface-muted hover:text-ink"
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
