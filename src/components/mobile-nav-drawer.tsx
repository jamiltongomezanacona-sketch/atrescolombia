"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { signOutAdmin } from "@/lib/admin/actions";
import type { NavItem } from "@/lib/store-navigation";
import { isStoreNavActive } from "@/lib/store-navigation";
import { cn } from "@/lib/cn";

type MobileNavDrawerProps = {
  items: NavItem[];
};

type AuthStatus = "unknown" | "signed-in" | "signed-out";

const EXTRA_LINKS: NavItem[] = [
  { key: "tiendas", label: "Tiendas", href: "/tiendas", kind: "route" },
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unknown");
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navContext = {
    pathname,
    categoria: searchParams.get("categoria"),
    ofertas: searchParams.get("ofertas"),
    novedades: searchParams.get("novedades"),
    tienda: searchParams.get("tienda"),
  };
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

  useEffect(() => {
    if (!open || authStatus !== "unknown") return;

    let active = true;

    async function loadAuthStatus() {
      try {
        const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (active) setAuthStatus(user ? "signed-in" : "signed-out");
      } catch {
        if (active) setAuthStatus("signed-out");
      }
    }

    void loadAuthStatus();

    return () => {
      active = false;
    };
  }, [authStatus, open]);

  const departmentLinks = items;
  const links = [
    ...EXTRA_LINKS.filter((link) => link.key === "tiendas"),
    ...departmentLinks.filter((item) => item.key !== "tiendas"),
    ...EXTRA_LINKS.filter(
      (link) =>
        link.key !== "tiendas" && !departmentLinks.some((item) => item.href === link.href || item.key === link.key),
    ),
  ];

  const panel =
    mounted &&
    createPortal(
      <div
        className={cn(
          "fixed inset-0 z-50",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
        {...(!open ? { inert: true } : {})}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black-main/72 transition-opacity",
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
            "theme-panel absolute inset-y-0 left-0 flex w-[min(88vw,330px)] flex-col text-ink shadow-lift transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-3">
            <Link href="/" className="min-w-0" onClick={() => setOpen(false)} tabIndex={open ? undefined : -1}>
              <p id={titleId} className="text-lg font-medium tracking-[0.14em]">
                ATRES
              </p>
              <p className="mt-0.5 text-xs font-normal text-ink-muted">Moda colombiana</p>
            </Link>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] hover:bg-surface-muted"
              aria-label="Cerrar menu"
              onClick={() => setOpen(false)}
            >
              <CloseIcon dark />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2.5 py-3" aria-label="Menu principal">
            <p className="px-2 text-[11px] font-medium tracking-wide text-ink-muted">Explorar</p>
            <ul className="mt-2 grid gap-0.5">
              {links.map((link) => {
                const active = isStoreNavActive(link, navContext);

                return (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex min-h-10 items-center rounded-[var(--radius-card)] px-3 text-sm font-normal transition",
                        active ? "bg-gold text-black-main" : "text-ink hover:bg-surface-muted hover:text-gold-light",
                      )}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? undefined : -1}
                    >
                      <span className="text-current">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <DrawerAccountSection
            authStatus={authStatus}
            open={open}
            onNavigate={() => setOpen(false)}
          />

          <div className="border-t border-white/10 p-3.5">
            <Link
              href="/productos?ofertas=1"
              className="theme-primary-button flex min-h-10 items-center justify-center rounded-[var(--radius-card)] px-4 text-sm font-medium"
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
        className="atres-interactive inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-card)] text-white/90 transition hover:bg-white/10 hover:text-gold-light lg:hidden"
        aria-expanded={open}
        aria-controls="atres-mobile-drawer"
        aria-haspopup="dialog"
        aria-label={open ? "Cerrar menu" : "Abrir menu principal"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>
      {panel}
    </>
  );
}

function DrawerAccountSection({
  authStatus,
  open,
  onNavigate,
}: {
  authStatus: AuthStatus;
  open: boolean;
  onNavigate: () => void;
}) {
  const signedIn = authStatus === "signed-in";

  return (
    <section className="border-t border-white/10 px-2.5 py-3" aria-label="Cuenta">
      <p className="px-2 text-[11px] font-medium tracking-wide text-ink-muted">Cuenta</p>
      <div className="mt-2 grid gap-0.5">
        {authStatus === "unknown" ? (
          <div className="flex min-h-10 items-center gap-2 rounded-[var(--radius-card)] px-3 text-sm text-ink-muted">
            <DrawerIcon type="user" />
            <span>Comprobando sesion</span>
          </div>
        ) : signedIn ? (
          <>
            <DrawerLink href="/admin/configuracion" label="Mi cuenta" icon="user" open={open} onNavigate={onNavigate} />
            <DrawerLink href="/admin" label="Panel de administracion" icon="store" open={open} onNavigate={onNavigate} />
            <form action={signOutAdmin} onSubmit={onNavigate}>
              <button
                type="submit"
                className="flex min-h-10 w-full items-center gap-2 rounded-[var(--radius-card)] px-3 text-left text-sm font-normal text-ink transition hover:bg-surface-muted hover:text-gold-light"
                tabIndex={open ? undefined : -1}
              >
                <DrawerIcon type="logout" />
                <span>Cerrar sesion</span>
              </button>
            </form>
          </>
        ) : (
          <>
            <DrawerLink href="/admin/login" label="Iniciar sesion" icon="user" open={open} onNavigate={onNavigate} />
            <DrawerLink href="/admin" label="Panel de administracion" icon="store" open={open} onNavigate={onNavigate} />
          </>
        )}
      </div>
    </section>
  );
}

function DrawerLink({
  href,
  label,
  icon,
  open,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: "user" | "store";
  open: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-10 items-center gap-2 rounded-[var(--radius-card)] px-3 text-sm font-normal text-ink transition hover:bg-surface-muted hover:text-gold-light"
      onClick={onNavigate}
      tabIndex={open ? undefined : -1}
    >
      <DrawerIcon type={icon} />
      <span>{label}</span>
    </Link>
  );
}

function DrawerIcon({ type }: { type: "user" | "store" | "logout" }) {
  if (type === "store") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 shrink-0 fill-none text-ink-muted"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 9h16l-1 11H5L4 9Z" />
        <path d="M8 9V7a4 4 0 0 1 8 0v2" />
        <path d="M9 13h6" />
      </svg>
    );
  }

  if (type === "logout") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-4 shrink-0 fill-none text-ink-muted"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4 shrink-0 fill-none text-ink-muted"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px] fill-none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-[18px] fill-none", dark ? "text-ink" : "text-white")}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
