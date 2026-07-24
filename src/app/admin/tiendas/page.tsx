import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ShopRowActions } from "@/components/admin/shop-row-actions";
import { Button } from "@/components/ui/button";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { getAdminShops } from "@/lib/admin/data";

export default async function AdminShopsPage() {
  const session = await requireSuperAdmin();
  const shops = await getAdminShops();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-5">
        <div className="theme-gold-panel relative overflow-hidden rounded-2xl p-4 text-white md:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gold" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-gold-light">Multitienda</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tiendas</h1>
              <p className="mt-1 text-sm font-normal text-white/72">
                Administra las tiendas independientes de ATRES.
              </p>
            </div>
            <Button href="/admin/tiendas/nueva" variant="secondary" className="rounded-full px-5">
              Crear tienda
            </Button>
          </div>
        </div>

        <div className="grid gap-3 lg:hidden">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>

        <div className="theme-panel hidden overflow-hidden rounded-2xl lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-black-main text-xs uppercase text-white/75">
                <tr>
                  <th className="p-4">Tienda</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Ciudad</th>
                  <th className="p-3">Productos</th>
                  <th className="p-3">Limites</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop.id} className="border-t border-white/10 transition hover:bg-surface-muted">
                    <td className="p-4">
                      <Link href={`/admin/tiendas/${shop.id}/editar`} className="font-semibold hover:underline">
                        {shop.name}
                      </Link>
                      <p className="mt-0.5 text-xs font-normal text-ink-muted">{shop.slug}</p>
                    </td>
                    <td className="p-3">
                      <AdminStatusBadge status={shop.status === "suspended" ? "hidden" : shop.status} />
                    </td>
                    <td className="p-3">{shop.city || "Sin ciudad"}</td>
                    <td className="p-3">{shop.product_count ?? 0}</td>
                    <td className="p-3">
                      {shop.max_products} productos / {shop.max_images} imagenes
                    </td>
                    <td className="p-3">
                      <ShopRowActions shopId={shop.id} status={shop.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!shops.length ? <p className="p-6 text-sm font-semibold text-ink-muted">No hay tiendas creadas.</p> : null}
        </div>
      </div>
    </AdminShell>
  );
}

function ShopCard({
  shop,
}: {
  shop: Awaited<ReturnType<typeof getAdminShops>>[number];
}) {
  return (
    <article className="theme-panel rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/admin/tiendas/${shop.id}/editar`} className="text-base font-semibold hover:underline">
            {shop.name}
          </Link>
          <p className="mt-0.5 text-xs font-normal text-ink-muted">{shop.slug}</p>
        </div>
        <AdminStatusBadge status={shop.status === "suspended" ? "hidden" : shop.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs font-semibold text-ink-muted">Ciudad</dt>
          <dd>{shop.city || "Sin ciudad"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-muted">Productos</dt>
          <dd>{shop.product_count ?? 0}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <ShopRowActions shopId={shop.id} status={shop.status} />
      </div>
    </article>
  );
}
