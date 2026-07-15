import { AdminShell } from "@/components/admin/admin-shell";
import { ActionStateForm, TextField } from "@/components/admin/action-state-form";
import { saveBanner } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminBanners } from "@/lib/admin/data";

export default async function AdminBannersPage() {
  await requireAdmin();
  const banners = await getAdminBanners();

  return (
    <AdminShell>
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-black">Crear banner</h1>
          <div className="mt-4">
            <BannerForm />
          </div>
        </section>
        <section className="bg-white p-4 shadow-sm">
          <h2 className="text-2xl font-black">Banners</h2>
          <div className="mt-4 grid gap-3">
            {banners.map((banner) => (
              <details key={banner.id} className="border border-zinc-200 p-3">
                <summary className="cursor-pointer text-sm font-black">
                  {banner.title} - {banner.status}
                </summary>
                <div className="mt-4">
                  <BannerForm banner={banner} />
                </div>
              </details>
            ))}
            {!banners.length ? <p className="text-sm font-semibold text-zinc-500">No hay banners.</p> : null}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function BannerForm({ banner }: { banner?: Awaited<ReturnType<typeof getAdminBanners>>[number] }) {
  return (
    <ActionStateForm action={saveBanner} submitLabel="Guardar banner">
      {banner?.id ? <input type="hidden" name="id" value={banner.id} /> : null}
      <TextField label="Titulo" name="title" defaultValue={banner?.title} required />
      <TextField label="Subtitulo" name="subtitle" defaultValue={banner?.subtitle} />
      <TextField label="Texto boton" name="button_text" defaultValue={banner?.button_text} />
      <TextField label="Enlace" name="link_url" defaultValue={banner?.link_url ?? "/productos"} />
      <TextField label="Imagen escritorio URL" name="desktop_image_url" defaultValue={banner?.desktop_image_url} />
      <TextField label="Imagen movil URL" name="mobile_image_url" defaultValue={banner?.mobile_image_url} />
      <div className="grid gap-3 md:grid-cols-2">
        <TextField label="Inicio" name="start_at" type="datetime-local" />
        <TextField label="Final" name="end_at" type="datetime-local" />
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Posicion
        <select name="position" defaultValue={banner?.position ?? "home_hero"} className="h-11 border border-zinc-300 px-3">
          <option value="home_hero">Hero Home</option>
          <option value="home_promo">Promo Home</option>
          <option value="category_top">Categoria</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Estado
        <select name="status" defaultValue={banner?.status ?? "hidden"} className="h-11 border border-zinc-300 px-3">
          <option value="active">Activo</option>
          <option value="hidden">Oculto</option>
          <option value="archived">Archivado</option>
        </select>
      </label>
      <TextField label="Orden" name="display_order" type="number" defaultValue={banner?.display_order ?? 0} />
    </ActionStateForm>
  );
}
