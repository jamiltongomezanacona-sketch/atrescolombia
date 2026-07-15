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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">Resumen operativo</p>
            <h1 className="text-3xl font-black">Dashboard</h1>
          </div>
          <Link href="/admin/productos/nuevo" className="bg-black px-4 py-3 text-sm font-black text-white">
            Crear producto
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard label="Productos" value={products.length} />
          <StatCard label="Activos" value={activeProducts.length} />
          <StatCard label="Ocultos" value={hiddenProducts.length} />
          <StatCard label="Bajo inventario" value={lowStock.length} />
          <StatCard label="Categorias" value={categories.length} />
          <StatCard label="Promos activas" value={activePromotions.length} />
          <StatCard label="Banners" value={banners.length} />
        </div>
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="bg-white p-4 shadow-sm">
            <h2 className="text-xl font-black">Productos recientes</h2>
            <div className="mt-4 grid gap-2">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}/editar`}
                  className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 py-3 text-sm"
                >
                  <span className="font-bold">{product.name}</span>
                  <span className="font-black">{product.status}</span>
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
              <Link key={href} href={href} className="bg-white p-4 text-sm font-black shadow-sm hover:bg-zinc-50">
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
