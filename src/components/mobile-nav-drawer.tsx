"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/store-navigation";
import { cn } from "@/lib/cn";

type MobileNavDrawerProps = {
  items: NavItem[];
};

const EXTRA_LINKS: NavItem[] = [
  { key: "catalogo", label: "Catalogo completo", href: "/productos", kind: "route" },
  { key: "categorias", label: "Todas las categorias", href: "/categorias", kind: "route" },
  { key: "buscar", label: "Buscar", href: "/buscar", kind: "route" },
  { key: "favoritos", label: "Favoritos", href: "/favoritos", kind: "route" },
  { key: "carrito", label: "Carrito", href: "/carrito", kind: "route" },
];

function subscribe() {
  return () => {};
}

export function MobileNavDrawer({ items }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const main = document.getElementById("contenido-principal");
    const footer = document.querySelector("footer");
    const bottomNav = document.querySelector('nav[aria-label="Navegacion principal"]');
    const trigger = triggerRef.current;
    main?.setAttribute("inert", "");
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
      footer?.removeAttribute("inert");
      bottomNav?.removeAttribute("inert");
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  const departmentLinks = items;
  const links = [
    ...departmentLinks,
    ...EXTRA_LINKS.filter((link) => !departmentLinks.some((item) => item.href === link.href)),
  ];

  const panel =
    mounted &&
    createPortal(
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/55 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Cerrar menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />

        <aside
          id="atres-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(88vw,320px)] flex-col bg-white text-ink shadow-lift transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-4">
            <div>
              <p id={titleId} className="text-lg font-medium tracking-tight">
                ATRES
              </p>
              <p className="text-xs font-normal text-stone-500">Moda colombiana del taller al cliente</p>
            </div>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-stone-100"
              aria-label="Cerrar menu"
              onClick={() => setOpen(false)}
            >
              <CloseIcon dark />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Menu de categorias">
            <p className="px-2 text-[11px] font-medium text-stone-400">Categorias</p>
            <ul className="mt-2 grid gap-1">
              {links.map((link) => {
                const active =
                  link.href === "/productos"
                    ? pathname === "/productos"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex min-h-11 items-center rounded-lg px-3 text-sm font-normal transition",
                        active ? "bg-black text-white" : "text-ink hover:bg-stone-100",
                      )}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? undefined : -1}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-black/5 p-4">
            <Link
              href="/ofertas"
              className="flex min-h-11 items-center justify-center rounded-full bg-brand px-4 text-sm font-medium text-white"
              onClick={() => setOpen(false)}
              tabIndex={open ? undefined : -1}
            >
              Ver ofertas
            </Link>
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
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
        aria-expanded={open}
        aria-controls="atres-mobile-drawer"
        aria-haspopup="dialog"
        aria-label={open ? "Cerrar menu" : "Abrir menu de categorias"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {panel}
    </>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-5 fill-none", dark ? "text-ink" : "text-white")}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
