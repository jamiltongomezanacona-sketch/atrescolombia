import Link from "next/link";
import { CatalogSortDrawer } from "@/components/catalog-sort-drawer";
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
  getPublicShopBySlug,
} from "@/lib/public-store";
import { normalizeNavSlug } from "@/lib/store-navigation";

export const metadata = {
  title: "Productos",
  description: "Catalogo completo de moda ATRES.",
};

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const filters = parseCatalogFilters(params);
  const [products, categories, displayCategories, activeShop] = await Promise.all([
    getPublicProducts(),
    getPublicCategories(),
    getPublicCategoriesForDisplay(),
    filters.tienda ? getPublicShopBySlug(filters.tienda) : Promise.resolve(null),
  ]);

  const options = collectFilterOptions(products, categories);
  const filteredProducts = applyCatalogFilters(products, filters, categories);
  const activeFilters = countActiveFilters(filters);
  const activeCategory = filters.categoria
    ? displayCategories.find(
        (category) => normalizeNavSlug(category.slug) === normalizeNavSlug(filters.categoria ?? ""),
      )
    : null;
  const pageTitle =
    activeShop?.title ||
    activeShop?.name ||
    activeCategory?.shortName ||
    (filters.ofertas ? "Ofertas" : filters.novedades ? "Novedades" : "Productos");

  const orderLinks = [
    { label: "Para ti", value: "relevancia" },
    { label: "Más vendidos", value: "tendencias" },
    { label: "Más recientes", value: "nuevos" },
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
      <section className="catalog-container products-catalog-container pb-2 pt-0 md:pb-4 md:pt-1.5 lg:pb-5 lg:pt-2">
        {/* Tablet only: mobile uses drawer navigation, desktop already has HeaderNav departments. */}
        <div className="catalog-sticky-chrome -mx-3 mb-1.5 hidden px-3 py-1 sm:block lg:hidden">
          <nav
            className="flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Departamentos del catalogo"
          >
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex h-7 shrink-0 items-center px-2.5 text-[11px] font-medium transition sm:text-xs ${
                  tab.active
                    ? "text-ink underline decoration-brand decoration-2 underline-offset-4"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                <span className="text-current">{tab.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="min-w-0">
          {/* Mobile: compact filter strip. Desktop/tablet: full chrome. */}
          <div className="catalog-sticky-chrome mb-0 px-2 py-0.5 sm:-mx-3 sm:mb-2 sm:px-3 sm:py-1.5 lg:mb-2.5">
            <div className="flex items-center justify-end gap-1.5 sm:hidden">
              <p className="mr-auto text-[11px] font-medium tabular-nums text-ink-muted">
                {filteredProducts.length}
              </p>
              <FilterDrawer filters={filters} options={options} label="Filtrar" />
              <CatalogSortDrawer filters={filters} options={orderLinks} />
            </div>

            <div className="hidden flex-col gap-1.5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-2.5">
                <h1 className="shrink-0 text-sm font-medium tracking-tight text-ink sm:text-base lg:text-lg">
                  {pageTitle}
                  <span className="ml-1.5 text-xs font-normal text-ink-muted sm:text-sm">
                    · {filteredProducts.length}
                  </span>
                </h1>
                {activeShop ? (
                  <Link
                    href="/tiendas"
                    className="text-[11px] font-medium text-ink-muted underline-offset-2 hover:text-ink hover:underline"
                  >
                    Todas las tiendas
                  </Link>
                ) : null}
                <FilterDrawer filters={filters} options={options} />
                {activeFilters > 0 ? (
                  <p className="text-[11px] font-normal text-ink-muted">
                    {activeFilters} filtro{activeFilters === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>

              <div
                className="flex items-center gap-0.5 overflow-x-auto pb-0 [scrollbar-width:none] sm:overflow-visible [&::-webkit-scrollbar]:hidden"
                aria-label="Ordenar catalogo"
              >
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
