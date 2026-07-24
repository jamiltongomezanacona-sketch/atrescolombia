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
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    const isMobileSheet = window.matchMedia("(max-width: 639px)").matches;
    if (isMobileSheet) {
      document.body.style.overflow = "hidden";
    }

    const main = document.getElementById("contenido-principal");
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const bottomNav = document.querySelector('nav[aria-label="Navegacion principal"]');
    const trigger = triggerRef.current;

    if (isMobileSheet) {
      main?.setAttribute("inert", "");
      header?.setAttribute("inert", "");
      footer?.setAttribute("inert", "");
      bottomNav?.setAttribute("inert", "");
    }

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      const sheet = document.getElementById("atres-filter-drawer");
      if (sheet?.contains(target)) return;
      setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.body.style.overflow = previous;
      main?.removeAttribute("inert");
      header?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      bottomNav?.removeAttribute("inert");
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      trigger?.focus();
    };
  }, [open]);

  const mobileSheet =
    mounted &&
    createPortal(
      <div
        className={cn(
          "fixed inset-0 z-50 sm:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black-main/70 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
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
            "theme-panel absolute inset-x-0 bottom-0 flex max-h-[84vh] flex-col rounded-t-[var(--radius-card)] shadow-lift transition-transform duration-300",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <FilterPanelHeader
            titleId={titleId}
            closeRef={closeRef}
            activeCount={activeCount}
            onClose={() => setOpen(false)}
          />
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <CatalogFiltersForm
              filters={filters}
              options={options}
              action={action}
              idPrefix="drawer-filter-mobile"
            />
          </div>
        </aside>
      </div>,
      document.body,
    );

  return (
    <div ref={rootRef} className="relative z-20">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "atres-interactive inline-flex h-9 items-center gap-2 rounded-[var(--radius-card)] px-3 text-xs font-medium transition sm:h-10 sm:px-3.5 sm:text-sm",
          activeCount > 0
            ? "bg-gold text-black-main shadow-soft ring-1 ring-gold"
            : "bg-surface text-ink ring-1 ring-white/10 hover:bg-surface-muted hover:text-gold-light",
        )}
        aria-label={
          open
            ? "Cerrar filtros"
            : activeCount > 0
              ? `Abrir filtros (${activeCount})`
              : "Abrir filtros"
        }
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="atres-filter-dropdown"
      >
        <FilterIcon />
        <span className="text-current">Filtros</span>
        {activeCount > 0 ? (
          <span
            className={cn(
              "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              "bg-brand text-black-main",
            )}
          >
            {activeCount}
          </span>
        ) : null}
        <ChevronIcon open={open} />
      </button>

      {/* Desktop / tablet dropdown */}
      <div
        id="atres-filter-dropdown"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        hidden={!open}
        className={cn(
          "theme-panel absolute left-0 top-[calc(100%+0.4rem)] hidden w-[min(92vw,22rem)] overflow-hidden rounded-[var(--radius-card)] shadow-lift sm:block",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <FilterPanelHeader
          titleId={titleId}
          closeRef={closeRef}
          activeCount={activeCount}
          onClose={() => setOpen(false)}
        />
        <div className="max-h-[min(70vh,28rem)] overflow-y-auto px-3 py-3">
          <CatalogFiltersForm
            filters={filters}
            options={options}
            action={action}
            idPrefix="drawer-filter-desktop"
          />
        </div>
      </div>

      {mobileSheet}
    </div>
  );
}

function FilterPanelHeader({
  titleId,
  closeRef,
  activeCount,
  onClose,
}: {
  titleId: string;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  activeCount: number;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
      <div className="flex items-center gap-2">
        <h2 id={titleId} className="text-sm font-medium tracking-tight text-ink sm:text-base">
          Filtros
        </h2>
        {activeCount > 0 ? (
          <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-medium text-black-main">
            {activeCount}
          </span>
        ) : null}
      </div>
      <button
        ref={closeRef}
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-ink-muted hover:bg-surface-muted hover:text-gold-light"
        aria-label="Cerrar filtros"
        onClick={onClose}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5 sm:size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-3.5 transition duration-200", open ? "rotate-180" : "rotate-0")}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
