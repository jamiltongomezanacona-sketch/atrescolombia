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
        <div className="relative overflow-hidden rounded-2xl bg-[#0b1f3a] p-4 text-white shadow-sm ring-1 ring-[#284a68] md:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#6ea8d9]" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-[#9fd2ff]">Multitienda</p>
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

        <div className="hidden overflow-hidden rounded-2xl bg-white/95 shadow-sm ring-1 ring-black/5 lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#0b1f3a] text-xs uppercase text-white/75">
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
                  <tr key={shop.id} className="border-t border-zinc-100 transition hover:bg-[#eef6ff]">
                    <td className="p-4">
                      <Link href={`/admin/tiendas/${shop.id}/editar`} className="font-semibold hover:underline">
                        {shop.name}
                      </Link>
                      <p className="mt-0.5 text-xs font-normal text-zinc-500">{shop.slug}</p>
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
                      <ShopRowActions shopId={shop.id} status={shop.status} email={shop.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!shops.length ? <p className="p-6 text-sm font-semibold text-zinc-500">No hay tiendas creadas.</p> : null}
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
    <article className="rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/admin/tiendas/${shop.id}/editar`} className="text-base font-semibold hover:underline">
            {shop.name}
          </Link>
          <p className="mt-0.5 text-xs font-normal text-zinc-500">{shop.slug}</p>
        </div>
        <AdminStatusBadge status={shop.status === "suspended" ? "hidden" : shop.status} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs font-semibold text-zinc-500">Ciudad</dt>
          <dd>{shop.city || "Sin ciudad"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-zinc-500">Productos</dt>
          <dd>{shop.product_count ?? 0}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <ShopRowActions shopId={shop.id} status={shop.status} email={shop.email} />
      </div>
    </article>
  );
}
