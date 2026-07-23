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
    <main className="min-h-screen overflow-x-hidden bg-ink text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 overflow-hidden border-r border-white/10 bg-ink p-4 text-white lg:block">
        <div className="relative">
          <BrandLogo href="/admin" compact dark sublabel="Panel privado" />
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
                    ? "bg-white text-ink"
                    : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      active ? "text-ink-muted" : "text-white/35",
                    )}
                  >
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="relative mt-8 rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[11px] font-medium tracking-wide text-white/55">ATRES Studio</p>
          <p className="mt-1.5 text-sm font-normal leading-5 text-white/70">
            Edita productos, imagenes y campanas con una vista clara del catalogo.
          </p>
        </div>
        <form action={signOutAdmin} className="absolute inset-x-4 bottom-4">
          <button
            type="submit"
            className="h-10 w-full rounded-[var(--radius-card)] bg-white text-sm font-medium text-ink transition hover:bg-surface-muted active:scale-[0.98]"
          >
            Cerrar sesion
          </button>
        </form>
      </aside>
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/96 px-3 py-2 text-white backdrop-blur sm:px-4 lg:hidden">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <BrandLogo href="/admin" compact dark sublabel="Admin" />
            <form action={signOutAdmin} className="shrink-0">
              <button
                type="submit"
                className="h-9 rounded-[var(--radius-card)] bg-white px-3 text-xs font-medium text-ink"
              >
                Salir
              </button>
            </form>
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
                      ? "bg-white text-ink"
                      : "bg-white/8 text-white/75 ring-1 ring-white/10 hover:bg-white/12",
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
      className="rounded-[var(--radius-card)] border border-black/8 bg-surface p-4 text-ink shadow-soft"
      role="status"
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-sm font-normal text-ink-muted">{body}</p>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-black/[0.06] bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
      <p className="text-[11px] font-medium tracking-wide text-ink-muted">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-tight text-ink">{value}</p>
    </div>
  );
}
