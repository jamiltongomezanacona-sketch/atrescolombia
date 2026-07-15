import Link from "next/link";
import { signOutAdmin } from "@/lib/admin/actions";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/promociones", label: "Promociones" },
  { href: "/admin/configuracion", label: "Configuracion" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white p-4 lg:block">
        <Link href="/admin" className="text-2xl font-black tracking-tight">
          ATRES Admin
        </Link>
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={signOutAdmin} className="absolute inset-x-4 bottom-4">
          <button className="h-11 w-full bg-black text-sm font-black text-white">
            Cerrar sesion
          </button>
        </form>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="text-lg font-black">
              ATRES Admin
            </Link>
            <form action={signOutAdmin}>
              <button className="bg-black px-3 py-2 text-xs font-black text-white">
                Salir
              </button>
            </form>
          </div>
          <nav className="mt-3 flex gap-3 overflow-x-auto text-sm font-bold [scrollbar-width:none]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-6">{children}</section>
      </div>
    </main>
  );
}

export function AdminNotice({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-amber-200 bg-amber-50 p-4">
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
