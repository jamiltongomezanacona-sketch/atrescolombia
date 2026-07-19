import Link from "next/link";
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
      <section className="catalog-container products-catalog-container pb-3 pt-1 md:pb-4 md:pt-1.5 lg:pb-5 lg:pt-2">
        {/* Mobile/tablet only: desktop already has HeaderNav departments */}
        <div className="sticky top-[3.5rem] z-30 -mx-4 mb-1.5 border-y border-black/[0.06] bg-background/95 px-4 py-1 backdrop-blur-xl sm:mx-0 sm:mb-2 sm:rounded-[var(--radius-card)] sm:border sm:bg-surface/90 sm:py-1 sm:shadow-soft lg:hidden">
          <nav
            className="flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Departamentos del catalogo"
          >
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex h-7 shrink-0 items-center rounded-[var(--radius-card)] px-2.5 text-[11px] font-medium transition sm:h-7 sm:text-xs ${
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

        <div className="min-w-0">
          {/* Single chrome band: title + filters + sort */}
          <div className="mb-2 flex flex-col gap-1.5 border-b border-black/[0.06] pb-2 sm:mb-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 lg:mb-3 lg:pb-2.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5">
              <h1 className="shrink-0 text-base font-medium tracking-tight text-ink sm:text-lg lg:text-xl">
                {pageTitle}
              </h1>
              <FilterDrawer filters={filters} options={options} />
              <p className="text-xs font-medium text-ink-muted">
                {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                {activeFilters > 0 ? (
                  <span className="ml-1.5 text-[11px] font-normal text-ink-muted/80">
                    {activeFilters} filtro{activeFilters === 1 ? "" : "s"}
                  </span>
                ) : null}
              </p>
            </div>

            <div
              className="flex items-center gap-0.5 overflow-x-auto pb-0 [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden"
              aria-label="Ordenar catalogo"
            >
              <span className="hidden shrink-0 pr-1.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted/70 md:inline">
                Ordenar
              </span>
              {orderLinks.map((link) => {
                const active = (filters.orden ?? "relevancia") === link.value;
                return (
                  <Link
                    key={link.value}
                    href={buildCatalogQuery({ ...filters, orden: link.value })}
                    className={`inline-flex h-7 shrink-0 items-center px-2 text-[11px] font-medium transition sm:h-8 sm:px-2.5 sm:text-xs ${
                      active
                        ? "text-ink underline decoration-brand decoration-2 underline-offset-4"
                        : "text-ink-muted hover:text-ink"
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
                <ProductCard key={product.slug} product={product} priority={index < 5} compact />
              ))}
            </div>
          )}
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
