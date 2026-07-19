"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { CatalogFiltersForm } from "@/components/catalog-filters";
import {
  countActiveFilters,
  type CatalogFilterOptions,
  type CatalogFilterState,
} from "@/lib/product-filters";
import { cn } from "@/lib/cn";

type FilterDrawerProps = {
  filters: CatalogFilterState;
  options: CatalogFilterOptions;
  action?: string;
};

function subscribe() {
  return () => {};
}

export function FilterDrawer({ filters, options, action = "/productos" }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const main = document.getElementById("contenido-principal");
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const bottomNav = document.querySelector('nav[aria-label="Navegacion principal"]');
    const trigger = triggerRef.current;
    main?.setAttribute("inert", "");
    header?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    bottomNav?.setAttribute("inert", "");

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      main?.removeAttribute("inert");
      header?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      bottomNav?.removeAttribute("inert");
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const panel =
    mounted &&
    createPortal(
      <div
        className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <button
          type="button"
          className={cn("absolute inset-0 bg-ink/45 transition-opacity", open ? "opacity-100" : "opacity-0")}
          aria-label="Cerrar filtros"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <aside
          id="atres-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "absolute flex flex-col bg-surface shadow-lift transition-transform duration-300 max-sm:inset-x-0 max-sm:bottom-0 max-sm:max-h-[84vh] max-sm:rounded-t-[var(--radius-card)] sm:inset-y-0 sm:right-0 sm:w-[min(92vw,380px)]",
            open ? "translate-x-0 translate-y-0" : "max-sm:translate-y-full sm:translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
            <h2 id={titleId} className="text-base font-medium tracking-tight text-ink">
              Filtros
            </h2>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] text-ink-muted hover:bg-surface-muted hover:text-ink"
              aria-label="Cerrar filtros"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4">
            <CatalogFiltersForm
              filters={filters}
              options={options}
              action={action}
              idPrefix="drawer-filter"
            />
          </div>
        </aside>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[var(--radius-card)] bg-ink px-3 text-xs font-medium text-white transition hover:bg-stone-800 sm:h-9 sm:px-3.5"
        aria-label={
          open ? "Cerrar filtros" : activeCount > 0 ? `Abrir filtros (${activeCount})` : "Abrir filtros"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="atres-filter-drawer"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 6h16" />
          <path d="M7 12h10" />
          <path d="M10 18h4" />
        </svg>
        Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      {panel}
    </>
  );
}
