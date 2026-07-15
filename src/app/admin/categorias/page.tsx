import { AdminShell } from "@/components/admin/admin-shell";
import { ActionStateForm, TextAreaField, TextField } from "@/components/admin/action-state-form";
import { saveCategory } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminCategories } from "@/lib/admin/data";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getAdminCategories();

  return (
    <AdminShell>
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-black">Crear categoria</h1>
          <div className="mt-4">
            <CategoryForm categories={categories} />
          </div>
        </section>
        <section className="bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-black">Categorias</h2>
          <div className="mt-4 grid gap-3">
            {categories.map((category) => (
              <details key={category.id} className="border border-zinc-200 p-3">
                <summary className="cursor-pointer text-sm font-black">
                  {category.name} - {category.status}
                </summary>
                <div className="mt-4">
                  <CategoryForm category={category} categories={categories} />
                </div>
              </details>
            ))}
            {!categories.length ? <p className="text-sm font-semibold text-zinc-500">No hay categorias.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function CategoryForm({
  category,
  categories,
}: {
  category?: Awaited<ReturnType<typeof getAdminCategories>>[number];
  categories: Awaited<ReturnType<typeof getAdminCategories>>;
}) {
  return (
    <ActionStateForm action={saveCategory} submitLabel="Guardar categoria">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <TextField label="Nombre" name="name" defaultValue={category?.name} required />
      <TextField label="Slug" name="slug" defaultValue={category?.slug} required />
      <TextAreaField label="Descripcion" name="description" defaultValue={category?.description} />
      <TextField label="Imagen URL" name="image_url" defaultValue={category?.image_url} />
      <label className="grid gap-2 text-sm font-bold">
        Categoria padre
        <select name="parent_id" defaultValue={category?.parent_id ?? ""} className="h-11 border border-zinc-300 px-3">
          <option value="">Sin padre</option>
          {categories
            .filter((item) => item.id !== category?.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Estado
        <select name="status" defaultValue={category?.status ?? "active"} className="h-11 border border-zinc-300 px-3">
          <option value="active">Activa</option>
          <option value="hidden">Oculta</option>
          <option value="archived">Archivada</option>
        </select>
      </label>
      <TextField label="Orden" name="display_order" type="number" defaultValue={category?.display_order ?? 0} />
    </ActionStateForm>
  );
}
