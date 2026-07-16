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
      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-[#eef6ff]/60 p-3 md:gap-4 md:p-4">
        <SectionTitle eyebrow="Informacion base" title="Datos principales" />
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
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
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#c7ddf2] bg-[#f5f9ff] p-3 md:gap-4 md:p-4">
        <SectionTitle eyebrow="Venta" title="Precio e inventario" />
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          <TextField label="Precio" name="price" type="number" defaultValue={product?.price ?? 0} required />
          <TextField label="Precio anterior" name="previous_price" type="number" defaultValue={product?.previous_price} />
          <TextField label="Descuento %" name="discount_percent" type="number" defaultValue={product?.discount_percent} />
          <TextField label="Inventario total" name="inventory_total" type="number" defaultValue={product?.inventory_total ?? 0} />
          <TextField label="Coleccion" name="collection" defaultValue={product?.collection} />
          <TextField label="Orden" name="display_order" type="number" defaultValue={product?.display_order ?? 0} />
          <AdminSelect label="Estado" name="status" defaultValue={product?.status ?? "hidden"} className="rounded-xl border-zinc-200 bg-zinc-50/70">
            <option value="active">Activo</option>
            <option value="hidden">Oculto</option>
            <option value="archived">Archivado</option>
          </AdminSelect>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:gap-4 md:p-4">
        <SectionTitle eyebrow="Contenido" title="Descripcion y etiquetas" />
        <TextAreaField label="Descripcion corta" name="short_description" defaultValue={product?.short_description} />
        <TextAreaField label="Descripcion completa" name="description" defaultValue={product?.description} />
        <TextField label="Etiquetas separadas por coma" name="tags" defaultValue={product?.tags?.join(", ")} />
        <p className="rounded-xl bg-[#eef6ff] p-3 text-xs font-bold leading-5 text-[#0b1f3a]">
          Para estilo tipo marketplace usa: badge:Top ventas, copy:pocas piezas, tono:sale, rank:Ahorra $5.000.
          Las etiquetas normales siguen apareciendo en detalles del producto.
        </p>
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#bcd7ee] bg-[#eef6ff]/60 p-3 md:gap-4 md:p-4">
        <SectionTitle eyebrow="Visibilidad" title="Etiquetas comerciales" />
        <div className="grid gap-3 sm:grid-cols-3">
          <OptionCheck label="Destacado" name="is_featured" defaultChecked={product?.is_featured} />
          <OptionCheck label="Nuevo" name="is_new" defaultChecked={product?.is_new} />
          <OptionCheck label="En oferta" name="is_promo" defaultChecked={product?.is_promo} />
        </div>
      </section>
    </ActionStateForm>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-wide text-[#2f6f9f]">{eyebrow}</p>
      <h2 className="mt-1 text-base font-black tracking-tight text-zinc-950 md:text-lg">{title}</h2>
    </div>
  );
}

function OptionCheck({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d8e7f5] bg-[#eef6ff]/70 px-3 text-sm font-bold transition hover:bg-white">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="size-4 accent-black" />
      {label}
    </label>
  );
}
