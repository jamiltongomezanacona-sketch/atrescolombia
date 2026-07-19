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

const fieldClass =
  "h-9 w-full rounded-[var(--radius-card)] border border-black/10 bg-surface px-2.5 text-sm font-normal text-ink outline-none transition focus:border-ink focus-visible:ring-2 focus-visible:ring-ring/30";

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
    <form method="get" action={action} className={cn("grid gap-3", className)}>
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
            className={fieldClass}
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
            className={fieldClass}
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
            className={fieldClass}
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
            className={fieldClass}
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
          <div className="grid grid-cols-2 gap-1.5">
            <label className="grid gap-1 text-[11px] font-normal text-ink-muted">
              Min
              <input
                type="number"
                name="precio_min"
                min={0}
                defaultValue={filters.precioMin ?? ""}
                placeholder={formatCOP(options.priceMin)}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1 text-[11px] font-normal text-ink-muted">
              Max
              <input
                type="number"
                name="precio_max"
                min={0}
                defaultValue={filters.precioMax ?? ""}
                placeholder={formatCOP(options.priceMax)}
                className={fieldClass}
              />
            </label>
          </div>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Estado">
        <div className="grid gap-1">
          <FilterToggle name="novedades" label="Novedades" checked={filters.novedades} />
          <FilterToggle name="ofertas" label="Ofertas" checked={filters.ofertas} />
          <FilterToggle name="disponible" label="Disponibles" checked={filters.disponible} />
        </div>
      </FilterGroup>

      <div className="grid gap-1.5 pt-0.5">
        <button
          type="submit"
          className="atres-interactive inline-flex h-9 items-center justify-center rounded-[var(--radius-card)] bg-ink px-3 text-sm font-medium text-white hover:bg-stone-800"
        >
          Aplicar filtros
        </button>
        {activeCount > 0 ? (
          <Link
            href={clearHref}
            className="atres-interactive inline-flex h-9 items-center justify-center rounded-[var(--radius-card)] bg-surface-muted px-3 text-sm font-medium text-ink-muted hover:bg-stone-200 hover:text-ink"
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
    <fieldset className="grid gap-1.5 border-b border-black/[0.06] pb-3 last:border-b-0 last:pb-0">
      <legend className="mb-0.5 text-[11px] font-medium tracking-wide text-ink-muted">{title}</legend>
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
    <label className="group relative flex min-h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-card)] px-1.5 text-sm font-normal text-ink-muted transition hover:bg-surface-muted hover:text-ink">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="peer sr-only" />
      <span className="grid size-4 place-items-center rounded-[3px] bg-surface text-transparent ring-1 ring-black/15 transition peer-checked:bg-ink peer-checked:text-white peer-checked:ring-ink">
        <CheckIcon />
      </span>
      <span className="peer-checked:text-ink">{label}</span>
    </label>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-2.5 fill-none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
