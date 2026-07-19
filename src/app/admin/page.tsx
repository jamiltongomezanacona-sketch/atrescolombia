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
        <div className="rounded-[var(--radius-card)] bg-ink p-5 text-white md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium tracking-wide text-white/55">ATRES Studio</p>
              <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">Dashboard</h1>
              <p className="mt-2 max-w-xl text-sm font-normal leading-6 text-white/65">
                Control rapido del catalogo, productos publicados, inventario y campanas activas.
              </p>
            </div>
            <Link
              href="/admin/productos/nuevo"
              className="rounded-[var(--radius-card)] bg-white px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-muted active:scale-[0.98]"
            >
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
        <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[var(--radius-card)] border border-black/[0.06] bg-surface p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-ink-muted">Edicion rapida</p>
                <h2 className="mt-0.5 text-xl font-medium text-ink">Productos recientes</h2>
              </div>
              <Link
                href="/admin/productos"
                className="rounded-[var(--radius-card)] bg-surface-muted px-3 py-2 text-xs font-medium text-ink-muted transition hover:bg-ink hover:text-white"
              >
                Ver todos
              </Link>
            </div>
            <div className="mt-4 grid gap-1.5">
              {products.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}/editar`}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-[var(--radius-card)] px-3 py-3 text-sm transition hover:bg-surface-muted"
                >
                  <span>
                    <span className="block font-medium text-ink">{product.name}</span>
                    <span className="mt-0.5 block text-xs font-normal text-ink-muted">
                      {product.sku || "Sin SKU"}
                    </span>
                  </span>
                  <span className="rounded-[var(--radius-card)] bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                    Editar
                  </span>
                </Link>
              ))}
              {!products.length ? (
                <p className="text-sm font-normal text-ink-muted">No hay productos.</p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-2">
            {[
              ["Productos", "/admin/productos"],
              ["Categorias", "/admin/categorias"],
              ["Banners", "/admin/banners"],
              ["Promociones", "/admin/promociones"],
              ["Configuracion", "/admin/configuracion"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-[var(--radius-card)] border border-black/[0.06] bg-surface p-4 text-sm font-medium transition hover:border-black/10 hover:shadow-soft"
              >
                <span className="block text-ink">{label}</span>
                <span className="mt-1 block text-xs font-normal text-ink-muted">Gestionar modulo</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
