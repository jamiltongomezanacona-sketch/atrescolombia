import { AdminShell } from "@/components/admin/admin-shell";
import { ActionStateForm, TextAreaField, TextField } from "@/components/admin/action-state-form";
import { ShopForm } from "@/components/admin/shop-form";
import { saveSettings } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { getPrimaryAdminShop, getStoreSettings } from "@/lib/admin/data";

export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  if (!session.isSuperAdmin) {
    const shop = await getPrimaryAdminShop(session);
    return (
      <AdminShell isSuperAdmin={session.isSuperAdmin}>
        <section className="theme-panel max-w-3xl p-4">
          <p className="theme-kicker">Tienda</p>
          <h1 className="text-3xl font-black">Datos de mi tienda</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-ink-muted">
            Actualiza la informacion visible de tu tienda dentro de ATRES.
          </p>
          <div className="mt-5">
            <ShopForm shop={shop} allowStatusEdit={false} submitLabel="Guardar mi tienda" />
          </div>
        </section>
      </AdminShell>
    );
  }

  const settings = await getStoreSettings();

  return (
    <AdminShell isSuperAdmin={session.isSuperAdmin}>
      <section className="theme-panel max-w-3xl p-4">
        <p className="theme-kicker">Tienda</p>
        <h1 className="text-3xl font-black">Configuracion general</h1>
        <div className="mt-5">
          <ActionStateForm action={saveSettings} submitLabel="Guardar configuracion">
            <TextField label="Nombre tienda" name="store_name" defaultValue={settings?.store_name ?? "ATRES"} />
            <TextField
              label="Logo URL"
              name="logo_url"
              defaultValue={settings?.logo_url}
              maxLength={1000}
              placeholder="/assets/... o https://..."
            />
            <TextField
              label="Favicon URL"
              name="favicon_url"
              defaultValue={settings?.favicon_url}
              maxLength={1000}
              placeholder="/assets/... o https://..."
            />
            <TextField
              label="Banner principal URL"
              name="hero_banner_url"
              defaultValue={settings?.hero_banner_url}
              maxLength={1000}
              placeholder="/assets/... o https://..."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="WhatsApp" name="whatsapp" defaultValue={settings?.whatsapp} />
              <TextField label="Correo" name="email" defaultValue={settings?.email} />
              <TextField label="Instagram" name="instagram" defaultValue={settings?.instagram} />
              <TextField label="TikTok" name="tiktok" defaultValue={settings?.tiktok} />
            </div>
            <TextField label="Direccion" name="address" defaultValue={settings?.address} />
            <TextAreaField label="Textos de envio" name="shipping_text" defaultValue={settings?.shipping_text} />
            <TextAreaField label="Politicas" name="policies" defaultValue={settings?.policies} />
            <TextAreaField label="Mensaje promocional" name="promo_message" defaultValue={settings?.promo_message} />
          </ActionStateForm>
        </div>
      </section>
    </AdminShell>
  );
}
