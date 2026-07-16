"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { signOutAdmin } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/admin", label: "Dashboard", hint: "Resumen", accent: "bg-[#8fbbe3]" },
  { href: "/admin/productos", label: "Productos", hint: "Catalogo", accent: "bg-[#5f90bd]" },
  { href: "/admin/categorias", label: "Categorias", hint: "Estructura", accent: "bg-[#78a8d2]" },
  { href: "/admin/banners", label: "Banners", hint: "Campanas", accent: "bg-[#416b92]" },
  { href: "/admin/promociones", label: "Promociones", hint: "Ofertas", accent: "bg-[#9fd2ff]" },
  { href: "/admin/configuracion", label: "Configuracion", hint: "Tienda", accent: "bg-[#6f7f91]" },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#07111f] text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-hidden bg-[#07111f] p-4 text-white shadow-[18px_0_60px_rgba(3,16,34,0.45)] lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[#0b1f3a]/74" />
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
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_14px_rgba(159,210,255,0.32)]", item.accent)} />
                    {item.label}
                  </span>
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
        <div className="relative mt-8 rounded-lg border border-[#284a68] bg-[#10233a] p-3">
          <p className="text-xs font-black uppercase tracking-wide text-[#9fd2ff]">ATRES Studio</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-white/72">
            Edita productos, imagenes y campanas con una vista clara del catalogo.
          </p>
        </div>
        <form action={signOutAdmin} className="absolute inset-x-4 bottom-4">
          <button type="submit" className="h-11 w-full rounded-lg bg-white text-sm font-black text-black transition hover:bg-zinc-100 active:scale-[0.98]">
            Cerrar sesion
          </button>
        </form>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#1a3550] bg-[#07111f]/96 px-4 py-3 text-white shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <BrandLogo href="/admin" compact sublabel="Admin" />
            <form action={signOutAdmin}>
              <button type="submit" className="h-9 rounded-full bg-[#dbeafe] px-4 text-xs font-black text-[#07111f]">
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
                    active ? "bg-[#dbeafe] text-[#07111f] ring-[#dbeafe]/30" : "bg-[#10233a] text-slate-200 ring-[#284a68] hover:bg-[#16304d]",
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
    <div className="rounded-lg border border-[#284a68] bg-[#10233a] p-4 text-white shadow-sm" role="status">
      <p className="text-sm font-black text-[#dbeafe]">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-200">{body}</p>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#d8e7f5] bg-[#f8fbff] p-4 shadow-sm ring-1 ring-[#0b1f3a]/5 transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="absolute inset-x-0 top-0 h-1 bg-[#2f6f9f]" />
      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{value}</p>
    </div>
  );
}
