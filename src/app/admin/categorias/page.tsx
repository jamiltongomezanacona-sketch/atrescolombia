import { AdminShell } from "@/components/admin/admin-shell";
import { ActionStateForm, TextAreaField, TextField } from "@/components/admin/action-state-form";
import { AdminSelect } from "@/components/admin/admin-select";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { buildIndentedCategoryOptions, sortCategoriesAsTree } from "@/lib/admin/category-options";
import { saveCategory } from "@/lib/admin/actions";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { getAdminCategories } from "@/lib/admin/data";

export default async function AdminCategoriesPage() {
  const session = await requireSuperAdmin();
  const categories = await getAdminCategories();
  const tree = sortCategoriesAsTree(categories);
  const parentNameById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase text-zinc-500">Catalogo</p>
          <h1 className="text-2xl font-black">Crear categoria</h1>
          <div className="mt-4">
            <CategoryForm categories={categories} />
          </div>
        </section>
        <section className="bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-black">Categorias</h2>
          <div className="mt-4 grid gap-2">
            {tree.map((category) => (
              <details
                key={category.id}
                className="border border-zinc-200 p-3"
                style={{ marginLeft: category.depth * 16 }}
              >
                <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm font-black">
                  <span>{category.name}</span>
                  <AdminStatusBadge status={category.status} />
                  {category.parent_id ? (
                    <span className="text-xs font-semibold text-zinc-500">
                      hijo de {parentNameById.get(category.parent_id) ?? "categoria"}
                    </span>
                  ) : null}
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
  const parentOptions = buildIndentedCategoryOptions(categories, { excludeId: category?.id });

  return (
    <ActionStateForm action={saveCategory} submitLabel="Guardar categoria">
      {category?.id ? <input type="hidden" name="id" value={category.id} /> : null}
      <TextField label="Nombre" name="name" defaultValue={category?.name} required />
      <TextField label="Slug" name="slug" defaultValue={category?.slug} required />
      <TextAreaField label="Descripcion" name="description" defaultValue={category?.description} />
      <TextField
        label="Imagen URL"
        name="image_url"
        defaultValue={category?.image_url}
        maxLength={1000}
        placeholder="/assets/... o https://..."
      />
      <AdminSelect label="Categoria padre" name="parent_id" defaultValue={category?.parent_id ?? ""}>
        <option value="">Sin padre</option>
        {parentOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </AdminSelect>
      <AdminSelect label="Estado" name="status" defaultValue={category?.status ?? "active"}>
        <option value="active">Activa</option>
        <option value="hidden">Oculta</option>
        <option value="archived">Archivada</option>
      </AdminSelect>
      <TextField label="Orden" name="display_order" type="number" defaultValue={category?.display_order ?? 0} />
    </ActionStateForm>
  );
}
