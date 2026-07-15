"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAdmin } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/promociones", label: "Promociones" },
  { href: "/admin/configuracion", label: "Configuracion" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white p-4 lg:block">
        <BrandLogo compact />
        <nav className="mt-8 grid gap-1" aria-label="Admin">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded px-3 py-2 text-sm font-bold transition",
                  active ? "bg-black text-white" : "text-zinc-700 hover:bg-zinc-100",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={signOutAdmin} className="mt-8">
          <button type="submit" className="h-10 w-full bg-zinc-900 text-sm font-black text-white">
            Cerrar sesion
          </button>
        </form>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo compact />
            <form action={signOutAdmin}>
              <button type="submit" className="h-9 bg-zinc-900 px-3 text-xs font-black text-white">
                Salir
              </button>
            </form>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none]" aria-label="Admin movil">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-black",
                    active ? "bg-black text-white" : "bg-zinc-100 text-zinc-700",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-6">{children}</section>
      </div>
    </main>
  );
}

export function AdminNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-amber-200 bg-amber-50 p-4" role="status">
      <p className="text-sm font-black text-amber-900">{title}</p>
      <p className="mt-1 text-sm font-semibold text-amber-800">{body}</p>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
