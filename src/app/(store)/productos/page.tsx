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
    { label: "Relevancia", value: "relevancia" },
    { label: "Trends", value: "tendencias" },
    { label: "Nuevos", value: "nuevos" },
    { label: "Menor precio", value: "precio-menor" },
    { label: "Mayor precio", value: "precio-mayor" },
    { label: "Descuento", value: "descuento" },
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
      <section className="catalog-container py-2 lg:py-3">
        <div className="mb-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand lg:text-xs">
            Catalogo ATRES
          </p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            Todos los productos
          </h1>
        </div>

        <div className="sticky top-[5.35rem] z-30 -mx-3 mb-3 border-y border-black/5 bg-background/95 px-3 py-2 backdrop-blur-xl sm:mx-0 sm:rounded-lg sm:border sm:bg-white/88 sm:shadow-soft lg:top-[7.25rem]">
          <form
            action="/productos"
            method="get"
            className="flex h-10 overflow-hidden rounded-full bg-white text-black shadow-sm ring-1 ring-black/10"
          >
            {hiddenFilterInputs(filters, ["q"])}
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              aria-label="Buscar productos"
              placeholder="Buscar productos ATRES..."
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

          <nav className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" aria-label="Departamentos del catalogo">
            {categoryTabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-black transition ${
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

        <div className="mb-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <p className="text-sm font-black text-stone-700">
              {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"}
              {activeFilters > 0 ? (
                <span className="ml-2 text-xs font-bold text-stone-500">
                  {activeFilters} filtro{activeFilters === 1 ? "" : "s"}
                </span>
              ) : null}
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
          <div className="catalog-grid">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 4} />
            ))}
          </div>
        )}
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
