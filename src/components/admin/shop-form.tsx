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
import { ShopLocationFields, type ShopLocationValues } from "@/components/admin/shop-location-fields";

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
  const [location, setLocation] = useState<ShopLocationValues>(() => locationFromShop(shop));
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
    if (values.city) setLocation((prev) => ({ ...prev, city: values.city || prev.city }));
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
    setLocation(locationFromShop(source));
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
    <form action={formAction} className="grid min-w-0 max-w-full gap-3 md:gap-5" encType="multipart/form-data">
      {shop?.id ? <input type="hidden" name="id" value={shop.id} /> : null}

      <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionTitle
            eyebrow="Velocidad"
            title={isCreate ? "Creacion rapida" : "Edicion rapida"}
          />
          <button
            type="button"
            onClick={toggleQuickMode}
            className="theme-secondary-button inline-flex min-h-11 w-full min-w-0 items-center justify-center rounded-full px-3 text-center text-xs font-black leading-4 sm:w-auto sm:px-4"
          >
            {quickMode ? "Ver formulario completo" : "Usar modo rapido"}
          </button>
        </div>

        {isCreate ? (
          <>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              {SHOP_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template.id)}
                  className={`min-h-11 min-w-0 rounded-xl border px-2.5 py-2 text-left transition sm:px-3 sm:py-3 ${
                    templateId === template.id
                      ? "border-gold bg-gold text-black-main"
                      : "border-white/10 bg-black-main/40 text-ink hover:border-[var(--border-gold-soft)] hover:bg-surface"
                  }`}
                >
                  <span className="block break-words text-sm font-black leading-4">{template.label}</span>
                  <span className={`mt-1 block break-words text-xs font-medium leading-4 ${templateId === template.id ? "text-black-main/70" : "text-ink-muted"}`}>
                    {template.hint}
                  </span>
                </button>
              ))}
            </div>

            {shops.length ? (
              <label className="grid min-w-0 gap-2 text-sm font-bold">
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

            <p className="min-w-0 text-xs font-medium leading-5 text-ink-muted">
              Plantilla activa: <strong>{selectedTemplate.label}</strong>. Completa nombre + admin y crea. Lo demas queda
              con valores listos.
            </p>
          </>
        ) : (
          <p className="text-xs font-medium leading-5 text-ink-muted">
            Misma vista que crear tienda: edita lo esencial y usa <strong>Mas opciones</strong> solo si lo necesitas.
          </p>
        )}
      </section>

      <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
        <SectionTitle eyebrow="Informacion" title="Datos de la tienda" />
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <label className="grid min-w-0 gap-2 text-sm font-bold">
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
            <label className="grid min-w-0 gap-2 text-sm font-bold">
              Titulo comercial
              <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
            </label>
          ) : (
            <input type="hidden" name="title" value={title || name} />
          )}
          <label className="grid min-w-0 gap-2 text-sm font-bold">
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
            <span id="shop-slug-hint" className="text-xs font-medium leading-5 text-ink-muted">
              Asi se vera en la web:{" "}
              <span className="break-all font-bold text-gold-light">/tiendas/{slug || "nombre-tienda"}</span>
            </span>
          </label>
          <label className="grid min-w-0 gap-2 text-sm font-bold">
            WhatsApp {quickMode ? <span className="font-medium text-ink-muted">(opcional)</span> : null}
            <input
              name="whatsapp"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, "").slice(0, 15))}
              className={inputClass}
              placeholder="573001112233"
            />
          </label>
          {!quickMode ? (
            <label className="grid min-w-0 gap-2 text-sm font-bold">
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
            <label className="grid min-w-0 gap-2 text-sm font-bold">
              Descripcion corta
              <textarea
                name="short_description"
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                rows={2}
                className={textareaClass}
              />
            </label>
            <label className="grid min-w-0 gap-2 text-sm font-bold">
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

      <ShopLocationFields
        values={location}
        onChange={(patch) => setLocation((prev) => ({ ...prev, ...patch }))}
        inputClass={inputClass}
        textareaClass={textareaClass}
      />

      <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
        <SectionTitle eyebrow="Imagen" title="Identidad visual" />
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
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
        <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
          <SectionTitle eyebrow="Administrador" title="Acceso inicial" />
          <div className="grid min-w-0 gap-3 md:grid-cols-3">
            <label className="grid min-w-0 gap-2 text-sm font-bold">
              Nombre
              <input
                name="admin_name"
                required
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="grid min-w-0 gap-2 text-sm font-bold">
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
            <label className="grid min-w-0 gap-2 text-sm font-bold">
              Contrasena temporal
              <div className="flex min-w-0 flex-col gap-2 min-[420px]:flex-row">
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
                  className="theme-primary-button inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl px-3 text-xs font-black min-[420px]:w-auto"
                >
                  Generar
                </button>
              </div>
            </label>
          </div>
          <p className="text-xs font-medium leading-5 text-ink-muted">
            Se crea el usuario en Supabase Auth con rol de tienda y se vincula automaticamente.
          </p>
        </section>
      ) : null}

      {allowStatusEdit ? (
        <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle eyebrow="Configuracion" title="Limites y visibilidad" />
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="min-h-10 self-start text-xs font-black text-gold-light underline-offset-2 hover:underline"
            >
              {showAdvanced ? "Ocultar avanzado" : "Mas opciones"}
            </button>
          </div>

          {showAdvanced ? (
            <>
              <div className="grid min-w-0 gap-3 md:grid-cols-2">
                <label className="grid min-w-0 gap-2 text-sm font-bold">
                  Maximo de productos
                  <input
                    name="max_products"
                    type="number"
                    value={maxProducts}
                    onChange={(event) => setMaxProducts(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-bold">
                  Maximo de imagenes
                  <input
                    name="max_images"
                    type="number"
                    value={maxImages}
                    onChange={(event) => setMaxImages(event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="grid min-w-0 gap-2 text-sm font-bold">
                  Estado
                  <select name="status" value={status} onChange={(event) => setStatus(event.target.value as AdminShop["status"])} className={inputClass}>
                    <option value="active">Activa</option>
                    <option value="suspended">Suspendida</option>
                    <option value="archived">Archivada</option>
                  </select>
                </label>
              </div>
              <div className="grid min-w-0 gap-3 sm:grid-cols-3">
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
              <p className="min-w-0 break-words text-xs font-medium text-ink-muted">
                Actual: {maxProducts} productos, {maxImages} imagenes, estado {status}.
              </p>
            </>
          )}
        </section>
      ) : (
        <section className="theme-panel grid min-w-0 max-w-full gap-3 rounded-xl p-3 md:p-4">
          <SectionTitle eyebrow="Visibilidad" title="Opciones de tienda" />
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
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
            state.ok ? "theme-ok" : "theme-error"
          } min-w-0 break-words rounded-[var(--radius-card)] p-3 text-sm font-medium`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="theme-panel sticky bottom-2 z-10 min-w-0 max-w-full rounded-[var(--radius-card)] p-2 backdrop-blur md:bottom-4">
        <Button type="submit" disabled={pending} variant="primary" className="h-11 w-full">
          {pending ? "Guardando..." : isCreate ? "Crear tienda ahora" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="min-w-0">
      <p className="theme-kicker">{eyebrow}</p>
      <h2 className="mt-1 break-words text-base font-black tracking-normal text-ink md:text-lg">{title}</h2>
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
    <div className="grid min-w-0 gap-2 text-sm font-bold">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <span className="min-w-0 break-words">{label}</span>
        <button
          type="button"
          disabled={!canPickFile || uploading}
          onClick={() => fileRef.current?.click()}
          className="theme-primary-button inline-flex min-h-11 min-w-0 items-center justify-center rounded-full px-3.5 text-center text-xs font-black leading-4 disabled:cursor-not-allowed disabled:opacity-50 max-[380px]:w-full"
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
        <label className="grid min-w-0 gap-1.5 text-xs font-bold text-ink-muted" htmlFor={`${inputId}-url`}>
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
        <p className="min-w-0 break-words text-xs font-medium text-ink-muted" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}

      <span
        className={`relative block max-w-full overflow-hidden rounded-xl bg-black-main ring-1 ring-white/10 ${
          compact ? "min-h-16" : "min-h-24"
        } ${previewClassName}`}
      >
        {previewSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewSrc} alt={`Vista previa ${label}`} className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full min-h-16 place-items-center px-2 text-center text-[11px] font-medium text-ink-muted">
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
    <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-black-main/40 px-3 text-sm font-bold transition hover:border-[var(--border-gold-soft)] hover:bg-surface">
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 shrink-0 accent-gold"
      />
      <span className="min-w-0 break-words leading-5">{label}</span>
    </label>
  );
}

function locationFromShop(shop?: AdminShop | null): ShopLocationValues {
  return {
    country: shop?.country || "Colombia",
    department: shop?.department || "",
    city: shop?.city || "",
    locality: shop?.locality || "",
    neighborhood: shop?.neighborhood || "",
    address: shop?.address || "",
    address_reference: shop?.address_reference || "",
    latitude: shop?.latitude != null ? String(shop.latitude) : "",
    longitude: shop?.longitude != null ? String(shop.longitude) : "",
    maps_url: shop?.maps_url || "",
    postal_code: shop?.postal_code || "",
    delivery_radius_km: shop?.delivery_radius_km != null ? String(shop.delivery_radius_km) : "",
    pickup_enabled: Boolean(shop?.pickup_enabled),
    local_delivery_enabled: Boolean(shop?.local_delivery_enabled),
    location_verified: Boolean(shop?.location_verified),
  };
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

const inputClass = "theme-field h-11 w-full min-w-0 max-w-full rounded-xl px-3 text-sm";
const textareaClass = "theme-field w-full min-w-0 max-w-full rounded-xl px-3 py-3 text-sm";
