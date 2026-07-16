"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAdmin } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", hint: "Resumen" },
  { href: "/admin/productos", label: "Productos", hint: "Catalogo" },
  { href: "/admin/categorias", label: "Categorias", hint: "Estructura" },
  { href: "/admin/banners", label: "Banners", hint: "Campanas" },
  { href: "/admin/promociones", label: "Promociones", hint: "Ofertas" },
  { href: "/admin/configuracion", label: "Configuracion", hint: "Tienda" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-hidden bg-zinc-950 p-4 text-white shadow-[18px_0_60px_rgba(0,0,0,0.18)] lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_32%)]" />
        <div className="relative">
          <BrandLogo href="/admin" compact dark sublabel="Panel privado" />
        </div>
        <nav className="relative mt-8 grid gap-1.5" aria-label="Admin">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group rounded-lg px-3 py-3 text-sm font-bold transition duration-200",
                  active
                    ? "bg-white text-black shadow-sm"
                    : "text-white/68 hover:bg-white/8 hover:text-white",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>{item.label}</span>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-wide",
                      active ? "text-zinc-500" : "text-white/36 group-hover:text-white/55",
                    )}
                  >
                    {item.hint}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="relative mt-8 rounded-lg border border-white/10 bg-white/6 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-white/45">ATRES Admin</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-white/72">
            Gestiona catalogo, imagenes y campanas desde un solo lugar.
          </p>
        </div>
        <form action={signOutAdmin} className="absolute inset-x-4 bottom-4">
          <button type="submit" className="h-11 w-full rounded-lg bg-white text-sm font-black text-black transition hover:bg-zinc-100 active:scale-[0.98]">
            Cerrar sesion
          </button>
        </form>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo href="/admin" compact sublabel="Admin" />
            <form action={signOutAdmin}>
              <button type="submit" className="h-9 rounded-full bg-zinc-900 px-4 text-xs font-black text-white">
                Salir
              </button>
            </form>
          </div>
          <nav
            className="mt-3 flex gap-2 overflow-x-auto [mask-image:linear-gradient(90deg,#000_85%,transparent)] [scrollbar-width:none] sm:[mask-image:none]"
            aria-label="Admin movil"
          >
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-black ring-1 ring-transparent transition",
                    active ? "bg-black text-white ring-black/10" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-5 lg:px-6 lg:py-7">{children}</section>
      </div>
    </main>
  );
}

export function AdminNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm" role="status">
      <p className="text-sm font-black text-amber-900">{title}</p>
      <p className="mt-1 text-sm font-semibold text-amber-800">{body}</p>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}
