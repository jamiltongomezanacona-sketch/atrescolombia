"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAdmin } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", hint: "Resumen" },
  { href: "/admin/tiendas", label: "Tiendas", hint: "Multitienda", superadminOnly: true },
  { href: "/admin/productos", label: "Productos", hint: "Catalogo" },
  { href: "/admin/categorias", label: "Categorias", hint: "Estructura", superadminOnly: true },
  { href: "/admin/banners", label: "Banners", hint: "Campanas", superadminOnly: true },
  { href: "/admin/promociones", label: "Promociones", hint: "Ofertas", superadminOnly: true },
  { href: "/admin/configuracion", label: "Configuracion", hint: "Tienda" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  isSuperAdmin = true,
}: {
  children: React.ReactNode;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => isSuperAdmin || !item.superadminOnly);

  return (
    <main className="admin-theme min-h-screen overflow-x-hidden text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-hidden border-r border-[var(--border-gold-soft)] bg-black-main p-4 text-white lg:block">
        <div className="relative flex items-start justify-between gap-2">
          <BrandLogo href="/admin" compact dark sublabel="Panel privado" />
          <Link
            href="/"
            aria-label="Ir a la tienda"
            title="Ir a la tienda"
            className="atres-interactive inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-card)] text-white/90 ring-1 ring-white/10 hover:bg-white/10 hover:text-gold-light"
          >
            <HomeIcon />
          </Link>
        </div>
        <nav className="relative mt-8 grid gap-1" aria-label="Admin">
          {visibleItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-[var(--radius-card)] px-3 py-2.5 text-sm font-medium transition duration-200",
                  active
                    ? "bg-gold text-black-main shadow-soft"
                    : "text-white/70 hover:bg-white/8 hover:text-gold-light",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      active ? "text-black-main/70" : "text-white/35",
                    )}
                  >
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="relative mt-8 rounded-[var(--radius-card)] border border-[var(--border-gold-soft)] bg-white/[0.04] p-3">
          <p className="text-[11px] font-medium tracking-wide text-gold-light">ATRES Studio</p>
          <p className="mt-1.5 text-sm font-normal leading-5 text-white/70">
            Edita productos, imagenes y campanas con una vista clara del catalogo.
          </p>
        </div>
        <form action={signOutAdmin} className="absolute inset-x-4 bottom-4">
          <button
            type="submit"
            className="theme-secondary-button h-10 w-full rounded-[var(--radius-card)] text-sm font-medium active:scale-[0.98]"
          >
            Cerrar sesion
          </button>
        </form>
      </aside>
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[var(--border-gold-soft)] bg-black-main/96 px-3 py-2 text-white backdrop-blur sm:px-4 lg:hidden">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <BrandLogo href="/admin" compact dark sublabel="Admin" />
            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                href="/"
                aria-label="Ir a la tienda"
                title="Ir a la tienda"
                className="atres-interactive inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-card)] text-white/90 ring-1 ring-white/10 hover:bg-white/10 hover:text-gold-light"
              >
                <HomeIcon />
              </Link>
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="theme-primary-button h-9 rounded-[var(--radius-card)] px-3 text-xs font-medium"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>
          <nav
            className="mt-2 flex max-w-full gap-1.5 overflow-x-auto scroll-smooth pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Admin movil"
          >
            {visibleItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "min-h-9 shrink-0 whitespace-nowrap rounded-[var(--radius-card)] px-2.5 py-1.5 text-[11px] font-medium transition sm:px-3 sm:py-2 sm:text-xs",
                    active
                      ? "bg-gold text-black-main"
                      : "bg-white/8 text-white/75 ring-1 ring-white/10 hover:bg-white/12 hover:text-gold-light",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <section className="mx-auto min-w-0 max-w-[1500px] overflow-x-hidden bg-background px-3 py-4 sm:px-5 lg:px-6 lg:py-7">
          {children}
        </section>
      </div>
    </main>
  );
}

export function AdminNotice({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="theme-panel rounded-[var(--radius-card)] p-4"
      role="status"
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm font-normal text-ink-muted">{body}</p>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="theme-panel rounded-[var(--radius-card)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--border-gold-soft)] hover:shadow-lift">
      <p className="text-[11px] font-medium tracking-wide text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-normal text-gold-light">{value}</p>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
