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
        className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <button
          type="button"
          className={cn("absolute inset-0 bg-black/50 transition-opacity", open ? "opacity-100" : "opacity-0")}
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
            "absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col bg-white shadow-lift transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-4">
            <h2 id={titleId} className="text-lg font-black">
              Filtros
            </h2>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-stone-100"
              aria-label="Cerrar filtros"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ×
              </span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
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
        className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-black text-ink ring-1 ring-black/10 lg:hidden"
        aria-label={
          open ? "Cerrar filtros" : activeCount > 0 ? `Abrir filtros (${activeCount})` : "Abrir filtros"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="atres-filter-drawer"
      >
        Filtros{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>
      {panel}
    </>
  );
}
