import { AdminShell } from "@/components/admin/admin-shell";
import { ShopForm } from "@/components/admin/shop-form";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { getAdminShops } from "@/lib/admin/data";

export default async function NewShopPage() {
  const session = await requireSuperAdmin();
  const shops = await getAdminShops();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-5">
        <div className="rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5 md:p-5">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Multitienda</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Crear tienda</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-500">
            Modo rapido con plantillas, duplicado y subida de logo/portada en el mismo paso.
          </p>
        </div>
        <ShopForm showAdminFields shops={shops} />
      </div>
    </AdminShell>
  );
}
