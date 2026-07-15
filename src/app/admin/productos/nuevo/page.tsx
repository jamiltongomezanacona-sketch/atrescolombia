import { AdminShell } from "@/components/admin/admin-shell";
import { QuickProductForm } from "@/components/admin/quick-product-form";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories } from "@/lib/admin/data";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getAdminCategories();

  return (
    <AdminShell>
      <div className="grid gap-4">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">Catalogo</p>
          <h1 className="text-3xl font-black">Carga rapida de producto</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-zinc-500">
            Crea productos desde celular o tablet con imagenes primero, automatizaciones y guardado sin recargar la pagina.
          </p>
        </div>
        <QuickProductForm categories={categories} />
      </div>
    </AdminShell>
  );
}
