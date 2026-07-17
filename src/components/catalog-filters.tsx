import Link from "next/link";
import {
  buildCatalogQuery,
  countActiveFilters,
  type CatalogFilterOptions,
  type CatalogFilterState,
} from "@/lib/product-filters";
import { formatCOP } from "@/lib/store-data";
import { cn } from "@/lib/cn";

type CatalogFiltersFormProps = {
  filters: CatalogFilterState;
  options: CatalogFilterOptions;
  action?: string;
  idPrefix?: string;
  className?: string;
};

export function CatalogFiltersForm({
  filters,
  options,
  action = "/productos",
  idPrefix = "filter",
  className,
}: CatalogFiltersFormProps) {
  const clearHref = buildCatalogQuery({ orden: filters.orden, q: filters.q }, action);
  const activeCount = countActiveFilters(filters);

  return (
    <form method="get" action={action} className={cn("grid gap-4", className)}>
      {filters.q ? <input type="hidden" name="q" value={filters.q} /> : null}
      {filters.orden && filters.orden !== "relevancia" ? (
        <input type="hidden" name="orden" value={filters.orden} />
      ) : null}

      {options.categories.length > 0 ? (
        <FilterGroup title="Categoria">
          <label htmlFor={`${idPrefix}-categoria`} className="sr-only">
            Categoria
          </label>
          <select
            id={`${idPrefix}-categoria`}
            name="categoria"
            defaultValue={filters.categoria ?? ""}
            className="h-10 w-full rounded-full border border-black/5 bg-stone-50 px-3 text-sm font-normal text-stone-800"
          >
            <option value="">Todas</option>
            {options.categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}

      {options.sizes.length > 0 ? (
        <FilterGroup title="Talla">
          <label htmlFor={`${idPrefix}-talla`} className="sr-only">
            Talla
          </label>
          <select
            id={`${idPrefix}-talla`}
            name="talla"
            defaultValue={filters.talla ?? ""}
            className="h-10 w-full rounded-full border border-black/5 bg-stone-50 px-3 text-sm font-normal text-stone-800"
          >
            <option value="">Todas</option>
            {options.sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}

      {options.colors.length > 0 ? (
        <FilterGroup title="Color">
          <label htmlFor={`${idPrefix}-color`} className="sr-only">
            Color
          </label>
          <select
            id={`${idPrefix}-color`}
            name="color"
            defaultValue={filters.color ?? ""}
            className="h-10 w-full rounded-full border border-black/5 bg-stone-50 px-3 text-sm font-normal text-stone-800"
          >
            <option value="">Todos</option>
            {options.colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}

      {options.collections.length > 0 ? (
        <FilterGroup title="Coleccion">
          <label htmlFor={`${idPrefix}-coleccion`} className="sr-only">
            Coleccion
          </label>
          <select
            id={`${idPrefix}-coleccion`}
            name="coleccion"
            defaultValue={filters.coleccion ?? ""}
            className="h-10 w-full rounded-full border border-black/5 bg-stone-50 px-3 text-sm font-normal text-stone-800"
          >
            <option value="">Todas</option>
            {options.collections.map((collection) => (
              <option key={collection} value={collection}>
                {collection}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}

      {(options.priceMin > 0 || options.priceMax > 0) && options.priceMax > options.priceMin ? (
        <FilterGroup title="Precio">
          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1 text-xs font-normal text-stone-500">
              Min
              <input
                type="number"
                name="precio_min"
                min={0}
                defaultValue={filters.precioMin ?? ""}
                placeholder={formatCOP(options.priceMin)}
                className="h-10 w-full rounded-full border border-black/5 bg-stone-50 px-3 text-sm font-normal text-stone-800"
              />
            </label>
            <label className="grid gap-1 text-xs font-normal text-stone-500">
              Max
              <input
                type="number"
                name="precio_max"
                min={0}
                defaultValue={filters.precioMax ?? ""}
                placeholder={formatCOP(options.priceMax)}
                className="h-10 w-full rounded-full border border-black/5 bg-stone-50 px-3 text-sm font-normal text-stone-800"
              />
            </label>
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Estado">
        <label className="flex min-h-9 items-center gap-2 text-sm font-normal text-stone-700">
          <input type="checkbox" name="novedades" value="1" defaultChecked={filters.novedades} />
          Solo novedades
        </label>
        <label className="flex min-h-9 items-center gap-2 text-sm font-normal text-stone-700">
          <input type="checkbox" name="ofertas" value="1" defaultChecked={filters.ofertas} />
          Solo ofertas
        </label>
        <label className="flex min-h-9 items-center gap-2 text-sm font-normal text-stone-700">
          <input type="checkbox" name="disponible" value="1" defaultChecked={filters.disponible} />
          Solo disponibles
        </label>
      </FilterGroup>

      <div className="grid gap-2">
        <button type="submit" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white">
          Aplicar filtros
        </button>
        {activeCount > 0 ? (
          <Link
            href={clearHref}
            className="inline-flex h-10 items-center justify-center rounded-full bg-stone-100 px-4 text-sm font-medium text-stone-700"
          >
            Limpiar ({activeCount})
          </Link>
        ) : null}
      </div>
    </form>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-2 border-b border-black/5 pb-3 last:border-b-0 last:pb-0">
      <legend className="text-xs font-medium text-stone-500">{title}</legend>
      {children}
    </fieldset>
  );
}
