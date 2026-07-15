import type { AdminCategory, AdminProduct } from "@/lib/admin/types";
import { saveProduct } from "@/lib/admin/actions";
import { ActionStateForm, TextAreaField, TextField } from "@/components/admin/action-state-form";
import { AdminSelect } from "@/components/admin/admin-select";
import { CategoryPickers } from "@/components/admin/category-pickers";

export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProduct | null;
  categories: AdminCategory[];
}) {
  return (
    <ActionStateForm action={saveProduct} submitLabel="Guardar producto">
      {product?.id ? <input type="hidden" name="id" value={product.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Nombre" name="name" defaultValue={product?.name} required />
        <TextField label="Slug unico" name="slug" defaultValue={product?.slug} required />
        <TextField label="SKU" name="sku" defaultValue={product?.sku} required />
        <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
          <CategoryPickers
            categories={categories}
            initialCategoryId={product?.category_id}
            initialSubcategoryId={product?.subcategory_id}
          />
        </div>
        <TextField label="Precio" name="price" type="number" defaultValue={product?.price ?? 0} required />
        <TextField label="Precio anterior" name="previous_price" type="number" defaultValue={product?.previous_price} />
        <TextField label="Descuento %" name="discount_percent" type="number" defaultValue={product?.discount_percent} />
        <TextField label="Inventario total" name="inventory_total" type="number" defaultValue={product?.inventory_total ?? 0} />
        <TextField label="Coleccion" name="collection" defaultValue={product?.collection} />
        <TextField label="Orden" name="display_order" type="number" defaultValue={product?.display_order ?? 0} />
        <AdminSelect label="Estado" name="status" defaultValue={product?.status ?? "hidden"}>
          <option value="active">Activo</option>
          <option value="hidden">Oculto</option>
          <option value="archived">Archivado</option>
        </AdminSelect>
      </div>
      <TextAreaField label="Descripcion corta" name="short_description" defaultValue={product?.short_description} />
      <TextAreaField label="Descripcion completa" name="description" defaultValue={product?.description} />
      <TextField label="Etiquetas separadas por coma" name="tags" defaultValue={product?.tags?.join(", ")} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="is_featured" type="checkbox" defaultChecked={product?.is_featured} />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="is_new" type="checkbox" defaultChecked={product?.is_new} />
          Nuevo
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input name="is_promo" type="checkbox" defaultChecked={product?.is_promo} />
          En oferta
        </label>
      </div>
    </ActionStateForm>
  );
}
