"use client";

import {
  useActionState,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { saveShop, uploadShopBrandImage } from "@/lib/admin/actions";
import type { AdminShop } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { ATRES_IMAGE_PLACEHOLDER } from "@/lib/local-media";

type ShopFormProps = {
  shop?: AdminShop | null;
  shops?: AdminShop[];
  showAdminFields?: boolean;
  allowStatusEdit?: boolean;
  submitLabel?: string;
};

type ShopTemplateId = "blank" | "moda" | "hogar" | "demo";

type ShopTemplate = {
  id: ShopTemplateId;
  label: string;
  hint: string;
  values: Partial<{
    title: string;
    short_description: string;
    description: string;
    city: string;
    max_products: number;
    max_images: number;
    allow_promotions: boolean;
    show_on_home: boolean;
    verified: boolean;
    logo_url: string;
    cover_url: string;
  }>;
};

const initialState = { ok: false, message: "" };
const MAX_UPLOAD_IMAGE_SIZE = 900 * 1024;
const IMAGE_QUALITY_STEPS = [0.82, 0.76, 0.68, 0.6];

const SHOP_TEMPLATES: ShopTemplate[] = [
  {
    id: "blank",
    label: "En blanco",
    hint: "Solo lo esencial",
    values: {
      max_products: 200,
      max_images: 10,
      show_on_home: true,
      allow_promotions: false,
      verified: false,
    },
  },
  {
    id: "moda",
    label: "Moda",
    hint: "Ropa y catalogo visual",
    values: {
      title: "Moda colombiana",
      short_description: "Catalogo de moda con compra directa por WhatsApp.",
      description: "Tienda de moda con prendas listas para explorar y contactar al vendedor.",
      city: "Bogota",
      max_products: 300,
      max_images: 10,
      show_on_home: true,
      allow_promotions: true,
      verified: false,
      cover_url: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
      logo_url: ATRES_IMAGE_PLACEHOLDER,
    },
  },
  {
    id: "hogar",
    label: "Hogar",
    hint: "Textiles y casa",
    values: {
      title: "Hogar y textiles",
      short_description: "Sabanas, cobijas y textiles para el hogar.",
      description: "Tienda enfocada en hogar y textiles con atencion directa.",
      city: "Medellin",
      max_products: 200,
      max_images: 10,
      show_on_home: true,
      allow_promotions: true,
      verified: false,
      cover_url: "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
      logo_url: ATRES_IMAGE_PLACEHOLDER,
    },
  },
  {
    id: "demo",
    label: "Demo",
    hint: "Lista para mostrar",
    values: {
      title: "Tienda demo ATRES",
      short_description: "Tienda de demostracion lista para cargar productos.",
      description: "Usa esta tienda para pruebas, demos comerciales o onboarding rapido.",
      city: "Colombia",
      max_products: 500,
      max_images: 10,
      show_on_home: true,
      allow_promotions: true,
      verified: true,
      cover_url: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
      logo_url: ATRES_IMAGE_PLACEHOLDER,
    },
  },
];

export function ShopForm({
  shop,
  shops = [],
  showAdminFields = false,
  allowStatusEdit = true,
  submitLabel = "Guardar tienda",
}: ShopFormProps) {
  const isCreate = !shop?.id;
  const [state, formAction, pending] = useActionState(saveShop, initialState);
  const [quickMode, setQuickMode] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateId, setTemplateId] = useState<ShopTemplateId>("blank");
  const [name, setName] = useState(shop?.name ?? "");
  const [title, setTitle] = useState(shop?.title ?? "");
  const [slug, setSlug] = useState(shop?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(shop?.slug));
  const [city, setCity] = useState(shop?.city ?? "");
  const [whatsapp, setWhatsapp] = useState(shop?.whatsapp ?? "");
  const [email, setEmail] = useState(shop?.email ?? "");
  const [shortDescription, setShortDescription] = useState(shop?.short_description ?? "");
  const [description, setDescription] = useState(shop?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(shop?.logo_url ?? "");
  const [coverUrl, setCoverUrl] = useState(shop?.cover_url ?? "");
  const [maxProducts, setMaxProducts] = useState(String(shop?.max_products ?? 200));
  const [maxImages, setMaxImages] = useState(String(shop?.max_images ?? 10));
  const [status, setStatus] = useState(shop?.status ?? "active");
  const [verified, setVerified] = useState(Boolean(shop?.verified));
  const [showOnHome, setShowOnHome] = useState(shop?.show_on_home ?? true);
  const [allowPromotions, setAllowPromotions] = useState(Boolean(shop?.allow_promotions));
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState(isCreate ? generatePassword() : "");
  const [duplicateId, setDuplicateId] = useState("");

  const selectedTemplate = useMemo(
    () => SHOP_TEMPLATES.find((item) => item.id === templateId) ?? SHOP_TEMPLATES[0],
    [templateId],
  );

  function applyTemplate(nextId: ShopTemplateId) {
    const template = SHOP_TEMPLATES.find((item) => item.id === nextId) ?? SHOP_TEMPLATES[0];
    setTemplateId(template.id);
    const values = template.values;
    if (values.title) setTitle(values.title);
    if (values.short_description) setShortDescription(values.short_description);
    if (values.description) setDescription(values.description);
    if (values.city) setCity(values.city);
    if (typeof values.max_products === "number") setMaxProducts(String(values.max_products));
    if (typeof values.max_images === "number") setMaxImages(String(values.max_images));
    if (typeof values.show_on_home === "boolean") setShowOnHome(values.show_on_home);
    if (typeof values.allow_promotions === "boolean") setAllowPromotions(values.allow_promotions);
    if (typeof values.verified === "boolean") setVerified(values.verified);
    if (values.logo_url && !logoUrl) setLogoUrl(values.logo_url);
    if (values.cover_url && !coverUrl) setCoverUrl(values.cover_url);
  }

  function applyDuplicate(shopId: string) {
    setDuplicateId(shopId);
    const source = shops.find((item) => item.id === shopId);
    if (!source) return;
    setName(`${source.name} (copia)`);
    setTitle(source.title || source.name);
    setSlugTouched(false);
    setSlug(slugifyClient(`${source.slug || source.name}-copia`));
    setCity(source.city || "");
    setWhatsapp(source.whatsapp || "");
    setEmail(source.email || "");
    setShortDescription(source.short_description || "");
    setDescription(source.description || "");
    setLogoUrl(source.logo_url || "");
    setCoverUrl(source.cover_url || "");
    setMaxProducts(String(source.max_products || 200));
    setMaxImages(String(source.max_images || 10));
    setStatus("active");
    setVerified(false);
    setShowOnHome(source.show_on_home ?? true);
    setAllowPromotions(Boolean(source.allow_promotions));
    setAdminName(source.name);
    setShowAdvanced(true);
  }

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugifyClient(value));
    if (!adminName && isCreate) setAdminName(value);
    if (!title) setTitle(value);
  }

  function toggleQuickMode() {
    setQuickMode((value) => {
      const next = !value;
      if (!next) setShowAdvanced(true);
      return next;
    });
  }

  return (
    <form action={formAction} className="grid gap-4 md:gap-5" encType="multipart/form-data">
      {shop?.id ? <input type="hidden" name="id" value={shop.id} /> : null}

      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle
            eyebrow="Velocidad"
            title={isCreate ? "Creacion rapida" : "Edicion rapida"}
          />
          <button
            type="button"
            onClick={toggleQuickMode}
            className="inline-flex h-10 items-center rounded-full bg-[#eef6ff] px-4 text-xs font-black text-[#0b1f3a] ring-1 ring-[#d8e7f5]"
          >
            {quickMode ? "Ver formulario completo" : "Usar modo rapido"}
          </button>
        </div>

        {isCreate ? (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {SHOP_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    templateId === template.id
                      ? "border-[#0b1f3a] bg-[#0b1f3a] text-white"
                      : "border-[#d8e7f5] bg-[#eef6ff]/70 text-zinc-900 hover:bg-white"
                  }`}
                >
                  <span className="block text-sm font-black">{template.label}</span>
                  <span className={`mt-1 block text-xs font-medium ${templateId === template.id ? "text-white/75" : "text-zinc-500"}`}>
                    {template.hint}
                  </span>
                </button>
              ))}
            </div>

            {shops.length ? (
              <label className="grid gap-2 text-sm font-bold">
                Duplicar tienda existente
                <select
                  value={duplicateId}
                  onChange={(event) => applyDuplicate(event.target.value)}
                  className={inputClass}
                >
                  <option value="">No duplicar</option>
                  {shops.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.slug})
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <p className="text-xs font-medium leading-5 text-zinc-500">
              Plantilla activa: <strong>{selectedTemplate.label}</strong>. Completa nombre + admin y crea. Lo demas queda
              con valores listos.
            </p>
          </>
        ) : (
          <p className="text-xs font-medium leading-5 text-zinc-500">
            Misma vista que crear tienda: edita lo esencial y usa <strong>Mas opciones</strong> solo si lo necesitas.
          </p>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
        <SectionTitle eyebrow="Informacion" title="Datos de la tienda" />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            Nombre de la tienda
            <input
              name="name"
              required
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className={inputClass}
            />
          </label>
          {!quickMode ? (
            <label className="grid gap-2 text-sm font-bold">
              Titulo comercial
              <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
            </label>
          ) : (
            <input type="hidden" name="title" value={title || name} />
          )}
          <label className="grid gap-2 text-sm font-bold">
            Enlace de la tienda
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugifyClient(event.target.value));
              }}
              className={inputClass}
              placeholder="ej: moda-bogota"
              aria-describedby="shop-slug-hint"
            />
            <span id="shop-slug-hint" className="text-xs font-medium leading-5 text-zinc-500">
              Asi se vera en la web:{" "}
              <span className="font-bold text-[#0b1f3a]">/tiendas/{slug || "nombre-tienda"}</span>
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Ciudad
            <input name="city" value={city} onChange={(event) => setCity(event.target.value)} className={inputClass} />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            WhatsApp {quickMode ? <span className="font-medium text-zinc-400">(opcional)</span> : null}
            <input
              name="whatsapp"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, "").slice(0, 15))}
              className={inputClass}
              placeholder="573001112233"
            />
          </label>
          {!quickMode ? (
            <label className="grid gap-2 text-sm font-bold">
              Correo
              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </label>
          ) : (
            <input type="hidden" name="email" value={email} />
          )}
        </div>
        {!quickMode ? (
          <>
            <label className="grid gap-2 text-sm font-bold">
              Descripcion corta
              <textarea
                name="short_description"
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                rows={2}
                className={textareaClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Descripcion completa
              <textarea
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className={textareaClass}
              />
            </label>
          </>
        ) : (
          <>
            <input type="hidden" name="short_description" value={shortDescription} />
            <input type="hidden" name="description" value={description} />
          </>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-[#eef6ff]/60 p-3 md:p-4">
        <SectionTitle eyebrow="Imagen" title="Identidad visual" />
        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewField
            label="Logo"
            name="logo_url"
            fileName="logo_file"
            kind="logo"
            shopId={shop?.id}
            value={logoUrl}
            onChange={setLogoUrl}
            previewClassName={quickMode ? "aspect-square w-24" : "aspect-square max-w-[140px]"}
            allowCreateUpload
            showUrlInput={!quickMode}
            compact={quickMode}
          />
          <PreviewField
            label="Portada"
            name="cover_url"
            fileName="cover_file"
            kind="cover"
            shopId={shop?.id}
            value={coverUrl}
            onChange={setCoverUrl}
            previewClassName={quickMode ? "aspect-[16/9] w-full max-w-[220px]" : "aspect-[16/9]"}
            allowCreateUpload
            showUrlInput={!quickMode}
            compact={quickMode}
          />
        </div>
      </section>

      {showAdminFields ? (
        <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
          <SectionTitle eyebrow="Administrador" title="Acceso inicial" />
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-bold">
              Nombre
              <input
                name="admin_name"
                required
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Usuario / correo
              <input
                name="admin_email"
                type="email"
                required
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Contrasena temporal
              <div className="flex gap-2">
                <input
                  name="admin_password"
                  type="text"
                  required
                  minLength={8}
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setAdminPassword(generatePassword())}
                  className="inline-flex h-11 shrink-0 items-center rounded-xl bg-[#0b1f3a] px-3 text-xs font-black text-white"
                >
                  Generar
                </button>
              </div>
            </label>
          </div>
          <p className="text-xs font-medium leading-5 text-zinc-500">
            Se crea el usuario en Supabase Auth con rol de tienda y se vincula automaticamente.
          </p>
        </section>
      ) : null}

      {allowStatusEdit ? (
        <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SectionTitle eyebrow="Configuracion" title="Limites y visibilidad" />
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="text-xs font-black text-[#2f6f9f] underline-offset-2 hover:underline"
            >
              {showAdvanced ? "Ocultar avanzado" : "Mas opciones"}
            </button>
          </div>

          {showAdvanced ? (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Maximo de productos
                  <input
                    name="max_products"
                    type="number"
                    value={maxProducts}
                    onChange={(event) => setMaxProducts(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Maximo de imagenes
                  <input
                    name="max_images"
                    type="number"
                    value={maxImages}
                    onChange={(event) => setMaxImages(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Estado
                  <select name="status" value={status} onChange={(event) => setStatus(event.target.value as AdminShop["status"])} className={inputClass}>
                    <option value="active">Activa</option>
                    <option value="suspended">Suspendida</option>
                    <option value="archived">Archivada</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <CheckField label="Tienda verificada" name="verified" checked={verified} onChange={setVerified} />
                <CheckField label="Mostrar en pagina principal" name="show_on_home" checked={showOnHome} onChange={setShowOnHome} />
                <CheckField label="Permitir promociones" name="allow_promotions" checked={allowPromotions} onChange={setAllowPromotions} />
              </div>
            </>
          ) : (
            <>
              <input type="hidden" name="max_products" value={maxProducts} />
              <input type="hidden" name="max_images" value={maxImages} />
              <input type="hidden" name="status" value={status} />
              {verified ? <input type="hidden" name="verified" value="on" /> : null}
              {showOnHome ? <input type="hidden" name="show_on_home" value="on" /> : null}
              {allowPromotions ? <input type="hidden" name="allow_promotions" value="on" /> : null}
              <p className="text-xs font-medium text-zinc-500">
                Actual: {maxProducts} productos, {maxImages} imagenes, estado {status}.
              </p>
            </>
          )}
        </section>
      ) : (
        <section className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-white p-3 md:p-4">
          <SectionTitle eyebrow="Visibilidad" title="Opciones de tienda" />
          <div className="grid gap-3 sm:grid-cols-2">
            <CheckField label="Mostrar en pagina principal" name="show_on_home" checked={showOnHome} onChange={setShowOnHome} />
            <CheckField label="Permitir promociones" name="allow_promotions" checked={allowPromotions} onChange={setAllowPromotions} />
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
          {pending ? "Guardando..." : isCreate ? "Crear tienda ahora" : submitLabel}
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

function PreviewField({
  label,
  name,
  fileName,
  kind,
  shopId,
  value,
  onChange,
  previewClassName,
  allowCreateUpload = false,
  showUrlInput = true,
  compact = false,
}: {
  label: string;
  name: string;
  fileName: string;
  kind: "logo" | "cover";
  shopId?: string | null;
  value: string;
  onChange: (value: string) => void;
  previewClassName: string;
  allowCreateUpload?: boolean;
  showUrlInput?: boolean;
  compact?: boolean;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();
  const [message, setMessage] = useState("");
  const [localPreview, setLocalPreview] = useState("");
  const canImmediateUpload = Boolean(shopId);
  const canPickFile = canImmediateUpload || allowCreateUpload;

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage("");
    startUpload(async () => {
      try {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          throw new Error("Solo se permiten JPG, PNG o WebP.");
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error("La imagen original debe pesar maximo 8MB.");
        }

        const webp = await normalizeBrandImage(file, kind);
        if (webp.size > MAX_UPLOAD_IMAGE_SIZE) {
          throw new Error("La imagen optimizada supera 900KB. Usa una foto mas liviana.");
        }

        if (shopId) {
          const formData = new FormData();
          formData.set("shopId", shopId);
          formData.set("kind", kind);
          formData.set("file", new File([webp], `${kind}.webp`, { type: "image/webp" }));
          const result = await uploadShopBrandImage(formData);
          if (!result.ok || !result.publicUrl) {
            throw new Error(result.message || "No se pudo subir la imagen.");
          }
          onChange(result.publicUrl);
          setLocalPreview("");
          setMessage(result.message);
        } else {
          const optimized = new File([webp], `${kind}.webp`, { type: "image/webp" });
          const transfer = new DataTransfer();
          transfer.items.add(optimized);
          if (fileRef.current) fileRef.current.files = transfer.files;
          const previewUrl = URL.createObjectURL(webp);
          setLocalPreview(previewUrl);
          onChange("");
          setMessage("Lista para subir al crear.");
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No se pudo preparar la imagen.");
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  const previewSrc = localPreview || value;

  return (
    <div className="grid gap-2 text-sm font-bold">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{label}</span>
        <button
          type="button"
          disabled={!canPickFile || uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex h-9 items-center justify-center rounded-full bg-[#0b1f3a] px-3.5 text-xs font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Preparando..." : compact ? "Subir" : "Subir del dispositivo"}
        </button>
        <input
          ref={fileRef}
          id={`${inputId}-file`}
          name={shopId ? undefined : fileName}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="sr-only"
          disabled={!canPickFile || uploading}
          onChange={onFileSelected}
        />
      </div>

      {showUrlInput ? (
        <label className="grid gap-1.5 text-xs font-bold text-zinc-500" htmlFor={`${inputId}-url`}>
          URL opcional
          <input
            id={`${inputId}-url`}
            name={name}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="/assets/... o URL Supabase"
            className={inputClass}
          />
        </label>
      ) : (
        <input type="hidden" name={name} value={value} />
      )}

      {message ? (
        <p className="text-xs font-medium text-zinc-600" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}

      <span
        className={`relative overflow-hidden rounded-xl bg-white ring-1 ring-black/5 ${
          compact ? "min-h-16" : "min-h-24"
        } ${previewClassName}`}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt={`Vista previa ${label}`} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full min-h-16 place-items-center px-2 text-center text-[11px] font-medium text-zinc-400">
            Sin imagen
          </span>
        )}
      </span>
    </div>
  );
}

function CheckField({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d8e7f5] bg-[#eef6ff]/70 px-3 text-sm font-bold transition hover:bg-white">
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-black"
      />
      {label}
    </label>
  );
}

function slugifyClient(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let output = "Atres";
  for (let i = 0; i < 8; i += 1) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${output}!`;
}

async function normalizeBrandImage(file: File, kind: "logo" | "cover") {
  const bitmap = await createImageBitmap(file);
  const targetRatio = kind === "logo" ? 1 : 16 / 9;
  const sourceRatio = bitmap.width / bitmap.height;
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;

  if (sourceRatio > targetRatio) {
    sw = bitmap.height * targetRatio;
    sx = (bitmap.width - sw) / 2;
  } else {
    sh = bitmap.width / targetRatio;
    sy = (bitmap.height - sh) / 2;
  }

  const maxWidth = kind === "logo" ? 1024 : 1600;
  for (const width of [Math.min(maxWidth, Math.round(sw)), 1080, 960, 720]) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(width / targetRatio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar la imagen.");

    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    for (const quality of IMAGE_QUALITY_STEPS) {
      const blob = await canvasToWebp(canvas, quality);
      if (blob.size <= MAX_UPLOAD_IMAGE_SIZE || width <= 720) {
        return blob;
      }
    }
  }

  throw new Error("No se pudo optimizar la imagen.");
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo convertir la imagen."));
      },
      "image/webp",
      quality,
    );
  });
}

const inputClass = "h-11 rounded-xl border border-[#c7ddf2] bg-[#f5f9ff] px-3 text-sm focus:border-[#0b1f3a] focus:bg-white";
const textareaClass = "rounded-xl border border-[#c7ddf2] bg-[#f5f9ff] px-3 py-3 text-sm focus:border-[#0b1f3a] focus:bg-white";
