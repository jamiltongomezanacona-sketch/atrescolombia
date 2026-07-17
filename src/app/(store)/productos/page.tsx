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
      <section className="catalog-container pt-1 pb-[calc(8.75rem+env(safe-area-inset-bottom))] md:py-3">
        <nav className="mb-1 hidden text-xs font-bold text-stone-500 md:block" aria-label="Ruta de navegacion">
          <Link href="/" className="hover:text-black">
            Inicio
          </Link>
          <span className="mx-2 text-stone-300">/</span>
          <span className="text-stone-700">Productos</span>
          {filters.categoria ? (
            <>
              <span className="mx-2 text-stone-300">/</span>
              <span className="capitalize text-stone-700">{filters.categoria.replaceAll("-", " ")}</span>
            </>
          ) : null}
        </nav>

        <div className="mb-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand lg:text-xs">
            ATRES edit
          </p>
          <h1 className="mt-0.5 text-xl font-black tracking-tight text-ink sm:text-3xl">
            Comprar por estilo
          </h1>
        </div>

        <div className="sticky top-[3.45rem] z-30 -mx-3 mb-2 border-y border-black/5 bg-background/95 px-3 py-1.5 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border sm:bg-white/88 sm:shadow-soft lg:top-[7.25rem]">
          <form
            action="/productos"
            method="get"
            className="flex h-9 overflow-hidden rounded-full bg-white text-black shadow-sm ring-1 ring-black/10"
          >
            {hiddenFilterInputs(filters, ["q"])}
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              aria-label="Buscar productos"
              placeholder="Buscar jeans, sets, hogar..."
              className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold placeholder:text-stone-400"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="inline-flex w-12 items-center justify-center text-black ring-1 ring-black/5"
            >
              <SearchIcon />
            </button>
          </form>

          <nav className="mt-1.5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" aria-label="Departamentos del catalogo">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex h-8 shrink-0 items-center rounded-full px-3 text-xs font-black transition ${
                  tab.active
                    ? "bg-black text-white shadow-sm"
                    : "bg-white text-stone-700 ring-1 ring-black/5 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-4">
          <aside className="sticky top-[8.25rem] hidden max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-white/88 p-3 shadow-soft ring-1 ring-black/5 lg:block">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-brand">Filtros</p>
                <p className="text-sm font-black text-ink">Refina tu busqueda</p>
              </div>
              {activeFilters > 0 ? (
                <span className="rounded-full bg-black px-2 py-1 text-[10px] font-black text-white">
                  {activeFilters}
                </span>
              ) : null}
            </div>
            <CatalogFiltersForm filters={filters} options={options} idPrefix="desktop-filter" />
          </aside>

          <div className="min-w-0">
            <div className="mb-2 grid gap-2 rounded-xl bg-white/82 p-2 shadow-sm ring-1 ring-black/5 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex items-center justify-between gap-2 sm:justify-start">
                <p className="text-sm font-black text-stone-700">
                  {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
                  {activeFilters > 0 ? (
                    <span className="ml-2 text-xs font-bold text-stone-500">
                      {activeFilters} filtro{activeFilters === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </p>
                <div className="lg:hidden">
                  <FilterDrawer filters={filters} options={options} />
                </div>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0">
                <span className="hidden shrink-0 items-center px-1 text-[11px] font-black uppercase tracking-wide text-stone-400 md:inline-flex">
                  Ordenar
                </span>
                {orderLinks.map((link) => {
                  const active = (filters.orden ?? "relevancia") === link.value;
                  return (
                    <Link
                      key={link.value}
                      href={buildCatalogQuery({ ...filters, orden: link.value })}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black transition ${
                        active
                          ? "bg-black text-white shadow-sm"
                          : "bg-white/75 text-stone-700 ring-1 ring-black/5 hover:bg-white"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
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

function hiddenFilterInputs(filters: CatalogFilterState, omit: Array<keyof CatalogFilterState> = []) {
  const omitted = new Set<keyof CatalogFilterState>(omit);
  const inputs: Array<[string, string | number | undefined]> = [
    ["categoria", filters.categoria],
    ["talla", filters.talla],
    ["color", filters.color],
    ["coleccion", filters.coleccion],
    ["precio_min", filters.precioMin],
    ["precio_max", filters.precioMax],
    ["orden", filters.orden && filters.orden !== "relevancia" ? filters.orden : undefined],
    ["novedades", filters.novedades ? "1" : undefined],
    ["ofertas", filters.ofertas ? "1" : undefined],
    ["disponible", filters.disponible ? "1" : undefined],
  ];

  return inputs
    .filter(([name, value]) => value != null && value !== "" && !omitted.has(nameToFilterKey(name)))
    .map(([name, value]) => <input key={name} type="hidden" name={name} value={String(value)} />);
}

function nameToFilterKey(name: string): keyof CatalogFilterState {
  if (name === "precio_min") return "precioMin";
  if (name === "precio_max") return "precioMax";
  return name as keyof CatalogFilterState;
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none" stroke="currentColor" strokeWidth="2">
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}
