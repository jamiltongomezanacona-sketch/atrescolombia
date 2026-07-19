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
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-normal text-stone-800 shadow-sm transition focus:border-brand"
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
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-normal text-stone-800 shadow-sm transition focus:border-brand"
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
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-normal text-stone-800 shadow-sm transition focus:border-brand"
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
            className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-normal text-stone-800 shadow-sm transition focus:border-brand"
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
                className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-normal text-stone-800 shadow-sm transition focus:border-brand"
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
                className="h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm font-normal text-stone-800 shadow-sm transition focus:border-brand"
              />
            </label>
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Estado">
        <div className="grid gap-2">
          <FilterToggle name="novedades" label="Novedades" checked={filters.novedades} />
          <FilterToggle name="ofertas" label="Ofertas" checked={filters.ofertas} />
          <FilterToggle name="disponible" label="Disponibles" checked={filters.disponible} />
        </div>
      </FilterGroup>

      <div className="grid gap-2">
        <button type="submit" className="atres-interactive inline-flex h-11 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white">
          Aplicar filtros
        </button>
        {activeCount > 0 ? (
          <Link
            href={clearHref}
            className="atres-interactive inline-flex h-11 items-center justify-center rounded-full bg-stone-100 px-4 text-sm font-medium text-stone-700 hover:bg-stone-200"
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
    <fieldset className="grid gap-2 border-b border-black/5 pb-4 last:border-b-0 last:pb-0">
      <legend className="mb-1 text-xs font-medium text-stone-500">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterToggle({
  name,
  label,
  checked,
}: {
  name: "novedades" | "ofertas" | "disponible";
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="group relative flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-white px-3 text-sm font-normal text-stone-700 shadow-sm ring-1 ring-black/10 transition hover:ring-black/15">
      <input
        type="checkbox"
        name={name}
        value="1"
        defaultChecked={checked}
        className="peer sr-only"
      />
      <span className="grid size-5 place-items-center rounded-full bg-stone-100 text-transparent ring-1 ring-black/10 transition peer-checked:bg-black peer-checked:text-white">
        <CheckIcon />
      </span>
      <span className="peer-checked:text-black">{label}</span>
    </label>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3 fill-none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
