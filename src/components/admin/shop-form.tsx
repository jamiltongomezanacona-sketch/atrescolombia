"use client";

import { useActionState, useState } from "react";
import { saveShop } from "@/lib/admin/actions";
import type { AdminShop } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";

type ShopFormProps = {
  shop?: AdminShop | null;
  showAdminFields?: boolean;
  allowStatusEdit?: boolean;
  submitLabel?: string;
};

const initialState = { ok: false, message: "" };

export function ShopForm({
  shop,
  showAdminFields = false,
  allowStatusEdit = true,
  submitLabel = "Guardar tienda",
}: ShopFormProps) {
  const [state, formAction, pending] = useActionState(saveShop, initialState);
  const [logoUrl, setLogoUrl] = useState(shop?.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState(shop?.cover_url ?? "");

  return (
    <form action={formAction} className="grid gap-4 md:gap-5">
      {shop?.id ? <input type="hidden" name="id" value={shop.id} /> : null}

      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
        <SectionTitle eyebrow="Informacion" title="Datos de la tienda" />
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nombre de la tienda" name="name" defaultValue={shop?.name} required />
          <Field label="Titulo comercial" name="title" defaultValue={shop?.title} />
          <Field label="Slug" name="slug" defaultValue={shop?.slug} required />
          <Field label="Ciudad" name="city" defaultValue={shop?.city} />
          <Field label="WhatsApp" name="whatsapp" defaultValue={shop?.whatsapp} />
          <Field label="Correo" name="email" type="email" defaultValue={shop?.email} />
        </div>
        <TextAreaField label="Descripcion corta" name="short_description" defaultValue={shop?.short_description} />
        <TextAreaField label="Descripcion completa" name="description" defaultValue={shop?.description} />
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-[#eef6ff]/60 p-3 md:p-4">
        <SectionTitle eyebrow="Imagen" title="Identidad visual" />
        <div className="grid gap-3 md:grid-cols-2">
          <PreviewField
            label="Logo URL"
            name="logo_url"
            value={logoUrl}
            onChange={setLogoUrl}
            previewClassName="aspect-square"
          />
          <PreviewField
            label="Portada URL"
            name="cover_url"
            value={coverUrl}
            onChange={setCoverUrl}
            previewClassName="aspect-[16/9]"
          />
        </div>
      </section>

      {showAdminFields ? (
        <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
          <SectionTitle eyebrow="Administrador" title="Acceso inicial" />
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Nombre" name="admin_name" required />
            <Field label="Usuario / correo" name="admin_email" type="email" required />
            <Field label="Contrasena temporal" name="admin_password" type="password" required />
          </div>
          <p className="text-xs font-medium leading-5 text-zinc-500">
            Se crea el usuario en Supabase Auth con rol de tienda y se vincula automaticamente. Requiere
            SUPABASE_SERVICE_ROLE_KEY en el servidor. Si falla el usuario, la tienda no se conserva.
          </p>
        </section>
      ) : null}

      {allowStatusEdit ? (
        <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
          <SectionTitle eyebrow="Configuracion" title="Limites y visibilidad" />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Maximo de productos" name="max_products" type="number" defaultValue={shop?.max_products ?? 200} />
            <Field label="Maximo de imagenes" name="max_images" type="number" defaultValue={shop?.max_images ?? 10} />
            <label className="grid gap-2 text-sm font-bold">
              Estado
              <select name="status" defaultValue={shop?.status ?? "active"} className={inputClass}>
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
                <option value="archived">Archivada</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <CheckField label="Tienda verificada" name="verified" defaultChecked={shop?.verified} />
            <CheckField label="Mostrar en pagina principal" name="show_on_home" defaultChecked={shop?.show_on_home ?? true} />
            <CheckField label="Permitir promociones" name="allow_promotions" defaultChecked={shop?.allow_promotions} />
          </div>
        </section>
      ) : (
        <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
          <SectionTitle eyebrow="Visibilidad" title="Opciones de tienda" />
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckField label="Mostrar en pagina principal" name="show_on_home" defaultChecked={shop?.show_on_home ?? true} />
            <CheckField label="Permitir promociones" name="allow_promotions" defaultChecked={shop?.allow_promotions} />
          </div>
          <input type="hidden" name="status" value={shop?.status ?? "active"} />
        </section>
      )}

      {state.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`${
            state.ok ? "bg-emerald-50 text-emerald-900 ring-emerald-100" : "bg-red-50 text-red-700 ring-red-100"
          } rounded-[var(--radius-card)] p-3 text-sm font-medium ring-1`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="sticky bottom-3 z-10 rounded-[var(--radius-card)] border border-black/8 bg-surface/95 p-2 shadow-soft backdrop-blur md:bottom-4">
        <Button type="submit" disabled={pending} variant="primary" className="h-11 w-full">
          {pending ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
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

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={3} className={textareaClass} />
    </label>
  );
}

function PreviewField({
  label,
  name,
  value,
  onChange,
  previewClassName,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  previewClassName: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/assets/... o https://..."
        className={inputClass}
      />
      <span className={`relative overflow-hidden rounded-xl bg-white ring-1 ring-black/5 ${previewClassName}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={`Vista previa ${label}`} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full place-items-center text-xs font-medium text-zinc-400">
            Sin imagen
          </span>
        )}
      </span>
    </label>
  );
}

function CheckField({
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

const inputClass = "h-11 rounded-xl border border-[#c7ddf2] bg-[#f5f9ff] px-3 text-sm focus:border-[#0b1f3a] focus:bg-white";
const textareaClass = "rounded-xl border border-[#c7ddf2] bg-[#f5f9ff] px-3 py-3 text-sm focus:border-[#0b1f3a] focus:bg-white";
