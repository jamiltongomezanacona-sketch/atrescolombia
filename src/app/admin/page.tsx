import Link from "next/link";
import { AdminShell, StatCard } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminBanners, getAdminCategories, getAdminProducts, getAdminPromotions } from "@/lib/admin/data";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [products, categories, banners, promotions] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
    getAdminBanners(),
    getAdminPromotions(),
  ]);
  const activeProducts = products.filter((product) => product.status === "active");
  const hiddenProducts = products.filter((product) => product.status === "hidden");
  const lowStock = products.filter((product) => product.inventory_total <= 5);
  const activePromotions = promotions.filter((promotion) => promotion.status === "active");

  return (
    <AdminShell>
      <div className="grid gap-5">
        <div className="rounded-2xl bg-zinc-950 p-5 text-white shadow-sm md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Resumen operativo</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Dashboard</h1>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-white/62">
                Control rapido del catalogo, productos publicados, inventario y campanas activas.
              </p>
            </div>
            <Link href="/admin/productos/nuevo" className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-100 active:scale-[0.98]">
              Crear producto
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Productos" value={products.length} />
          <StatCard label="Activos" value={activeProducts.length} />
          <StatCard label="Ocultos" value={hiddenProducts.length} />
          <StatCard label="Bajo inventario" value={lowStock.length} />
          <StatCard label="Categorias" value={categories.length} />
          <StatCard label="Promos activas" value={activePromotions.length} />
          <StatCard label="Banners" value={banners.length} />
        </div>
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Edicion rapida</p>
                <h2 className="text-xl font-black">Productos recientes</h2>
              </div>
              <Link href="/admin/productos" className="rounded-full bg-zinc-100 px-3 py-2 text-xs font-black text-zinc-700 hover:bg-black hover:text-white">
                Ver todos
              </Link>
            </div>
            <div className="mt-4 grid gap-2">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}/editar`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-3 text-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                >
                  <span>
                    <span className="block font-black">{product.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-zinc-500">{product.sku || "Sin SKU"}</span>
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-700 ring-1 ring-black/5">{product.status}</span>
                </Link>
              ))}
              {!products.length ? <p className="text-sm font-semibold text-zinc-500">No hay productos.</p> : null}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              ["Productos", "/admin/productos"],
              ["Categorias", "/admin/categorias"],
              ["Banners", "/admin/banners"],
              ["Promociones", "/admin/promociones"],
              ["Configuracion", "/admin/configuracion"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="rounded-2xl bg-white/92 p-4 text-sm font-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                <span className="block">{label}</span>
                <span className="mt-1 block text-xs font-semibold text-zinc-500">Gestionar modulo</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
