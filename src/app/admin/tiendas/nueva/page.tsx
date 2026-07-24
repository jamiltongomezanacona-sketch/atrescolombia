import { AdminShell } from "@/components/admin/admin-shell";
import { ShopForm } from "@/components/admin/shop-form";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { getAdminShops } from "@/lib/admin/data";

export default async function NewShopPage() {
  const session = await requireSuperAdmin();
  const shops = await getAdminShops();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid min-w-0 gap-4 md:gap-5">
        <div className="theme-panel min-w-0 rounded-xl p-3 sm:p-4 md:p-5">
          <p className="theme-kicker">Multitienda</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Crear tienda</h1>
          <p className="mt-1.5 max-w-2xl text-sm font-semibold leading-5 text-ink-muted sm:leading-6">
            Modo rapido con plantillas, duplicado y subida de logo/portada en el mismo paso.
          </p>
        </div>
        <ShopForm showAdminFields shops={shops} />
      </div>
    </AdminShell>
  );
}
