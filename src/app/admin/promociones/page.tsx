import { AdminShell } from "@/components/admin/admin-shell";
import { ActionStateForm, TextAreaField, TextField } from "@/components/admin/action-state-form";
import { savePromotion } from "@/lib/admin/actions";
import { requireSuperAdmin } from "@/lib/admin/auth";
import { getAdminPromotions } from "@/lib/admin/data";

export default async function AdminPromotionsPage() {
  const session = await requireSuperAdmin();
  const promotions = await getAdminPromotions();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="theme-panel p-4">
          <h1 className="text-2xl font-black">Crear promocion</h1>
          <div className="mt-4">
            <PromotionForm />
          </div>
        </section>
        <section className="theme-panel p-4">
          <h2 className="text-2xl font-black">Promociones</h2>
          <div className="mt-4 grid gap-3">
            {promotions.map((promotion) => (
              <details key={promotion.id} className="theme-muted-panel p-3">
                <summary className="cursor-pointer text-sm font-black">
                  {promotion.name} - {promotion.status}
                </summary>
                <div className="mt-4">
                  <PromotionForm promotion={promotion} />
                </div>
              </details>
            ))}
            {!promotions.length ? <p className="text-sm font-semibold text-ink-muted">No hay promociones.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function PromotionForm({ promotion }: { promotion?: Awaited<ReturnType<typeof getAdminPromotions>>[number] }) {
  return (
    <ActionStateForm action={savePromotion} submitLabel="Guardar promocion">
      {promotion?.id ? <input type="hidden" name="id" value={promotion.id} /> : null}
      <TextField label="Nombre" name="name" defaultValue={promotion?.name} required />
      <TextField label="Slug" name="slug" defaultValue={promotion?.slug} required />
      <TextAreaField label="Descripcion" name="description" defaultValue={promotion?.description} />
      <label className="grid gap-2 text-sm font-bold">
        Tipo descuento
        <select name="discount_type" defaultValue={promotion?.discount_type ?? "percent"} className="theme-field h-11 rounded-[var(--radius-card)] px-3">
          <option value="percent">Porcentaje</option>
          <option value="fixed_price">Precio especial</option>
        </select>
      </label>
      <TextField label="Valor descuento" name="discount_value" type="number" defaultValue={promotion?.discount_value ?? 0} />
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Inicio" name="start_at" type="datetime-local" />
        <TextField label="Final" name="end_at" type="datetime-local" />
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Estado
        <select name="status" defaultValue={promotion?.status ?? "hidden"} className="theme-field h-11 rounded-[var(--radius-card)] px-3">
          <option value="active">Activa</option>
          <option value="hidden">Oculta</option>
          <option value="archived">Archivada</option>
        </select>
      </label>
    </ActionStateForm>
  );
}
