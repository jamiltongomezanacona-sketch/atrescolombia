import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ShopForm } from "@/components/admin/shop-form";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { getAdminShop, getAdminShopMembers } from "@/lib/admin/data";

type EditShopPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ guardado?: string }>;
};

export default async function EditShopPage({ params, searchParams }: EditShopPageProps) {
  const session = await requireSuperAdmin();
  const { id } = await params;
  const [shop, members, query] = await Promise.all([
    getAdminShop(id, session),
    getAdminShopMembers(id),
    searchParams,
  ]);

  if (!shop) notFound();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-5">
        <div className="theme-panel rounded-2xl p-4 md:p-5">
          <p className="theme-kicker">Multitienda</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Editar tienda</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-ink-muted">
            Misma experiencia que crear: modo rapido, enlace claro y logo/portada al instante.
          </p>
        </div>
        {query?.guardado ? (
          <p className="theme-ok rounded-xl p-3 text-sm font-bold">
            Tienda guardada.
          </p>
        ) : null}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <ShopForm shop={shop} />
          <aside className="theme-panel rounded-2xl p-4">
            <p className="theme-kicker">Administradores</p>
            <h2 className="mt-1 text-xl font-black">Accesos vinculados</h2>
            <div className="mt-4 grid gap-2">
              {members.map((member) => (
                <div key={member.id} className="theme-muted-panel rounded-xl p-3 text-sm">
                  <p className="font-black">{member.role}</p>
                  <p className="mt-1 break-all text-xs font-semibold text-ink-muted">{member.user_id}</p>
                </div>
              ))}
              {!members.length ? (
                <p className="text-sm font-semibold text-ink-muted">No hay administradores vinculados.</p>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </AdminShell>
  );
}
