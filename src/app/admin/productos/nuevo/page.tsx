import { AdminShell } from "@/components/admin/admin-shell";
import { QuickProductForm } from "@/components/admin/quick-product-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories } from "@/lib/admin/data";

export default async function NewProductPage() {
  const session = await requireAdmin();
  const categories = await getAdminCategories();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-5">
        <div className="rounded-2xl bg-white/92 p-4 shadow-sm ring-1 ring-black/5 md:p-5">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Catalogo</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Carga rapida de producto</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-zinc-500">
            Crea productos desde celular o tablet con imagenes primero, automatizaciones y guardado sin recargar la pagina.
          </p>
        </div>
        <QuickProductForm categories={categories} />
      </div>
    </AdminShell>
  );
}
