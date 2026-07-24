"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { buildCatalogQuery, type CatalogFilterState } from "@/lib/product-filters";
import { cn } from "@/lib/cn";

type SortOption = {
  label: string;
  value: string;
};

type CatalogSortDrawerProps = {
  filters: CatalogFilterState;
  options: SortOption[];
  action?: string;
};

function subscribe() {
  return () => {};
}

export function CatalogSortDrawer({
  filters,
  options,
  action = "/productos",
}: CatalogSortDrawerProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const baseTitleId = useId();
  const sheetTitleId = `${baseTitleId}-sheet`;
  const dropdownTitleId = `${baseTitleId}-dropdown`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const activeValue = filters.orden ?? "relevancia";
  const activeLabel = options.find((option) => option.value === activeValue)?.label ?? "Ordenar";

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
      const sheet = document.getElementById("atres-sort-drawer");
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

  const optionList = (
    <div className="grid gap-1 p-2">
      {options.map((option) => {
        const active = option.value === activeValue;
        return (
          <Link
            key={option.value}
            href={buildCatalogQuery({ ...filters, orden: option.value }, action)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "atres-interactive flex min-h-10 items-center justify-between rounded-[var(--radius-card)] px-3 text-sm font-medium",
              active
                ? "bg-gold text-black-main"
                : "text-ink-muted hover:bg-surface-muted hover:text-gold-light",
            )}
          >
            <span>{option.label}</span>
            {active ? <CheckIcon /> : null}
          </Link>
        );
      })}
    </div>
  );

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
          aria-label="Cerrar ordenamiento"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <aside
          id="atres-sort-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
          className={cn(
            "theme-panel absolute inset-x-0 bottom-0 flex max-h-[74vh] flex-col rounded-t-[var(--radius-card)] shadow-lift transition-transform duration-300",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2.5">
            <div>
              <h2 id={sheetTitleId} className="text-sm font-medium tracking-tight text-ink">
                Ordenar
              </h2>
              <p className="mt-0.5 text-[11px] font-normal text-ink-muted">{activeLabel}</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-ink-muted hover:bg-surface-muted hover:text-gold-light"
              aria-label="Cerrar ordenamiento"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                x
              </span>
            </button>
          </div>
          {optionList}
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
        className="atres-interactive inline-flex h-9 items-center gap-2 rounded-[var(--radius-card)] bg-surface px-3 text-xs font-medium text-ink ring-1 ring-white/10 transition hover:bg-surface-muted hover:text-gold-light"
        aria-label="Abrir ordenamiento"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="atres-sort-dropdown"
      >
        <SortIcon />
        <span>Ordenar</span>
      </button>

      <div
        id="atres-sort-dropdown"
        role="dialog"
        aria-modal="true"
        aria-labelledby={dropdownTitleId}
        hidden={!open}
        className={cn(
          "theme-panel absolute right-0 top-[calc(100%+0.4rem)] hidden w-[min(92vw,18rem)] overflow-hidden rounded-[var(--radius-card)] shadow-lift sm:block",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="border-b border-white/10 px-3.5 py-2.5">
          <h2 id={dropdownTitleId} className="text-sm font-medium tracking-tight text-ink">
            Ordenar
          </h2>
        </div>
        {optionList}
      </div>

      {mobileSheet}
    </div>
  );
}

function SortIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 4v16" />
      <path d="m5 7 3-3 3 3" />
      <path d="m5 17 3 3 3-3" />
      <path d="M16 6h4" />
      <path d="M14 12h6" />
      <path d="M12 18h8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 fill-none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
