import { AdminShell } from "@/components/admin/admin-shell";
import { ProductForm } from "@/components/admin/product-form";
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
          <h1 className="text-3xl font-black">Crear producto</h1>
        </div>
        <section className="bg-white p-4 shadow-sm">
          <ProductForm categories={categories} />
        </section>
      </div>
    </AdminShell>
  );
}
