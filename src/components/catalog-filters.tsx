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
  "theme-field h-9 w-full rounded-[var(--radius-card)] px-2.5 text-sm font-normal";

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

      {options.cities.length > 0 ? (
        <FilterGroup title="Ciudad">
          <label htmlFor={`${idPrefix}-ciudad`} className="sr-only">
            Ciudad
          </label>
          <select
            id={`${idPrefix}-ciudad`}
            name="ciudad"
            defaultValue={filters.ciudad ?? ""}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {options.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </FilterGroup>
      ) : null}

      {options.shops.length > 0 ? (
        <FilterGroup title="Tienda">
          <label htmlFor={`${idPrefix}-tienda`} className="sr-only">
            Tienda
          </label>
          <select
            id={`${idPrefix}-tienda`}
            name="tienda"
            defaultValue={filters.tienda ?? ""}
            className={fieldClass}
          >
            <option value="">Todas</option>
            {options.shops.map((shop) => (
              <option key={shop.slug} value={shop.slug}>
                {shop.city ? `${shop.label} - ${shop.city}` : shop.label}
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

      <FilterGroup title="Disponibilidad">
        <FilterToggle name="disponible" label="Solo disponibles" checked={filters.disponible} />
      </FilterGroup>

      <FilterGroup title="Ofertas">
        <FilterToggle name="ofertas" label="Ver ofertas" checked={filters.ofertas} />
      </FilterGroup>

      <FilterGroup title="Novedades">
        <FilterToggle name="novedades" label="Ver novedades" checked={filters.novedades} />
      </FilterGroup>

      <div className="grid gap-1.5 pt-0.5">
        <button
          type="submit"
          className="theme-primary-button atres-interactive inline-flex h-9 items-center justify-center rounded-[var(--radius-card)] px-3 text-sm font-medium"
        >
          Aplicar filtros
        </button>
        {activeCount > 0 ? (
          <Link
            href={clearHref}
            className="theme-secondary-button atres-interactive inline-flex h-9 items-center justify-center rounded-[var(--radius-card)] px-3 text-sm font-medium"
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
    <fieldset className="grid gap-1.5 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
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
    <label className="group relative flex min-h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-card)] px-1.5 text-sm font-normal text-ink-muted transition hover:bg-surface-muted hover:text-gold-light">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="peer sr-only" />
      <span className="grid size-4 place-items-center rounded-[3px] bg-black-main text-transparent ring-1 ring-white/15 transition peer-checked:bg-gold peer-checked:text-black-main peer-checked:ring-gold">
        <CheckIcon />
      </span>
      <span className="peer-checked:text-gold-light">{label}</span>
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
