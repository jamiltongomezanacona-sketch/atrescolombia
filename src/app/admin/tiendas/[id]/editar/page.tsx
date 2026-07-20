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
        <div className="rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5 md:p-5">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Multitienda</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Editar tienda</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-500">
            Ajusta informacion publica, limites y estado operativo.
          </p>
        </div>
        {query?.guardado ? (
          <p className="rounded-xl bg-[#eef6ff] p-3 text-sm font-bold text-[#0b1f3a] ring-1 ring-[#d8e7f5]">
            Tienda guardada.
          </p>
        ) : null}
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <ShopForm shop={shop} />
          <aside className="rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Administradores</p>
            <h2 className="mt-1 text-xl font-black">Accesos vinculados</h2>
            <div className="mt-4 grid gap-2">
              {members.map((member) => (
                <div key={member.id} className="rounded-xl bg-[#eef6ff] p-3 text-sm">
                  <p className="font-black">{member.role}</p>
                  <p className="mt-1 break-all text-xs font-semibold text-zinc-500">{member.user_id}</p>
                </div>
              ))}
              {!members.length ? (
                <p className="text-sm font-semibold text-zinc-500">No hay administradores vinculados.</p>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </AdminShell>
  );
}
