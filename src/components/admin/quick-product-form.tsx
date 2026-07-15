"use client";

import { useMemo, useRef, useState } from "react";
import { CategoryPickers } from "@/components/admin/category-pickers";
import type { AdminCategory } from "@/lib/admin/types";
import { cleanupQuickProductUploads, createQuickProduct, uploadQuickProductImage } from "@/lib/admin/actions";
import type { QuickProductImageInput } from "@/lib/admin/actions";

type QuickProductFormProps = {
  categories: AdminCategory[];
};

type LocalImage = {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
};

type Status = "hidden" | "active";
type SaveMode = "status" | "draft" | "publish" | "another";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const initialAdvanced = {
  slug: "",
  sku: "",
  subcategoryId: "",
  collection: "",
  displayOrder: "0",
  shortDescription: "",
  description: "",
  tags: "",
  isFeatured: false,
  isNew: false,
  isPromo: false,
};

export function QuickProductForm({ categories }: QuickProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [previousPrice, setPreviousPrice] = useState("");
  const [inventory, setInventory] = useState("1");
  const [status, setStatus] = useState<Status>("hidden");
  const [advanced, setAdvanced] = useState(initialAdvanced);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string; productId?: string } | null>(null);

  const generatedSlug = useMemo(() => slugify(name), [name]);
  const effectiveSlug = slugify(advanced.slug || name);
  const skuPreview = advanced.sku.trim() || buildSkuPreview(name);
  const discountPercent = useMemo(() => {
    const current = Number(price);
    const before = Number(previousPrice);
    if (!Number.isFinite(current) || !Number.isFinite(before) || current <= 0 || before <= current) return null;
    return Math.round(((before - current) / before) * 100);
  }, [price, previousPrice]);

  function addFiles(files: File[]) {
    setMessage(null);
    const accepted = files.filter((file) => file.type.startsWith("image/"));

    if (accepted.length !== files.length) {
      setMessage({ type: "error", text: "Solo se permiten imagenes." });
    }

    const valid = accepted.filter((file) => file.size <= MAX_IMAGE_SIZE);
    if (valid.length !== accepted.length) {
      setMessage({ type: "error", text: "Cada imagen debe pesar maximo 8MB." });
    }

    setImages((current) => {
      const available = MAX_IMAGES - current.length;
      const selected = valid.slice(0, available).map((file, index) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: current.length === 0 && index === 0,
      }));

      if (valid.length > available) {
        setMessage({ type: "error", text: `Puedes subir maximo ${MAX_IMAGES} imagenes por producto.` });
      }

      return [...current, ...selected];
    });
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((item) => item.id !== id);
      return ensurePrimary(next);
    });
  }

  function setPrimary(id: string) {
    setImages((current) => current.map((item) => ({ ...item, isPrimary: item.id === id })));
  }

  function moveImage(id: string, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const index = next.findIndex((item) => item.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= next.length) return current;
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  async function save(mode: SaveMode) {
    setMessage(null);
    setProgress("");

    const saveStatus = mode === "draft" ? "hidden" : mode === "publish" ? "active" : status;
    const parsedPrice = Number(price);
    const parsedInventory = inventory.trim() ? Number(inventory) : 1;

    if (!images.length) {
      failAndFocus("Sube al menos una imagen del producto.");
      return;
    }
    if (!name.trim()) {
      setMessage({ type: "error", text: "El nombre es obligatorio." });
      return;
    }
    if (!categoryId) {
      setMessage({ type: "error", text: "Selecciona una categoria." });
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMessage({ type: "error", text: "Ingresa un precio valido." });
      return;
    }
    if (previousPrice.trim() && !Number.isFinite(Number(previousPrice))) {
      setMessage({ type: "error", text: "El precio anterior no es valido." });
      return;
    }

    setSaving(true);

    const uploadedPaths: string[] = [];
    const plannedProductId = crypto.randomUUID();
    let createdProductId = plannedProductId;

    try {
      const coreProductPayload = {
        id: plannedProductId,
        name: name.trim(),
        slug: advanced.slug.trim() ? effectiveSlug : uniqueSlug(effectiveSlug),
        category_id: categoryId,
        price: Math.round(parsedPrice),
        previous_price: previousPrice.trim() ? Math.round(Number(previousPrice)) : null,
        discount_percent: discountPercent,
        sku: advanced.sku.trim() || buildSku(name),
        inventory_total: Number.isFinite(parsedInventory) && parsedInventory >= 0 ? Math.round(parsedInventory) : 1,
        status: saveStatus,
      };
      const productPayload = {
        ...coreProductPayload,
        short_description: advanced.shortDescription.trim(),
        description: advanced.description.trim(),
        subcategory_id: advanced.subcategoryId.trim() || null,
        is_featured: advanced.isFeatured,
        is_new: advanced.isNew,
        is_promo: advanced.isPromo || Boolean(discountPercent),
        tags: advanced.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        collection: advanced.collection.trim(),
        display_order: Number(advanced.displayOrder) || 0,
      };

      const orderedImages = orderImages(images);
      const uploadedImages: QuickProductImageInput[] = [];

      for (const [index, image] of orderedImages.entries()) {
        setProgress(`Subiendo imagen ${index + 1} de ${orderedImages.length}...`);
        const webp = await normalizeImage(image.file);
        const imageFormData = new FormData();
        imageFormData.set("productId", plannedProductId);
        imageFormData.set("fileName", image.file.name);
        imageFormData.set("displayOrder", String(index + 1));
        imageFormData.set("isPrimary", String(image.isPrimary || index === 0));
        imageFormData.set("file", new File([webp], `${image.id}.webp`, { type: "image/webp" }));
        const uploadResult = await uploadQuickProductImage(imageFormData);

        if (!uploadResult.ok || !uploadResult.image) {
          throw new Error(uploadResult.message);
        }

        uploadedPaths.push(uploadResult.image.storage_path);
        uploadedImages.push(uploadResult.image);
      }

      const primaryImage = uploadedImages.find((image) => image.is_primary) ?? uploadedImages[0];
      setProgress("Creando producto...");
      const result = await createQuickProduct({
        ...productPayload,
        primary_image_url: primaryImage.public_url,
        images: uploadedImages,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      createdProductId = result.productId ?? plannedProductId;
      setProgress("");
      setMessage({
        type: "ok",
        text:
          saveStatus === "active"
            ? mode === "another"
              ? "Producto publicado. Listo para cargar el siguiente."
              : "Producto publicado correctamente. Ya debe aparecer en la tienda."
            : mode === "another"
              ? "Producto guardado como oculto. No aparece en la tienda hasta publicarlo. Listo para cargar el siguiente."
              : "Producto guardado como oculto. No aparece en la tienda hasta cambiarlo a Publicado.",
        productId: createdProductId,
      });

      if (mode === "another") {
        resetForAnother();
      }
    } catch (error) {
      if (uploadedPaths.length) {
        await cleanupQuickProductUploads(uploadedPaths);
      }
      setMessage({ type: "error", text: error instanceof Error ? error.message : "No se pudo guardar el producto." });
      setProgress("");
    } finally {
      setSaving(false);
    }
  }

  function failAndFocus(text: string) {
    setMessage({ type: "error", text });
    imagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForAnother() {
    images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    setImages([]);
    setName("");
    setPrice("");
    setPreviousPrice("");
    setInventory("1");
    setAdvanced(initialAdvanced);
    setShowAdvanced(false);
    window.setTimeout(() => {
      imagesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      fileInputRef.current?.focus();
    }, 100);
  }

  return (
    <div className="grid gap-5 pb-28 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
      <section ref={imagesRef} className="grid gap-4 bg-white p-4 shadow-sm lg:sticky lg:top-24">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">Paso 1</p>
          <h2 className="text-2xl font-black">Imagenes del producto</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            Sube de 1 a 10 imagenes. Se comprimen y convierten a WebP antes de subir.
          </p>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`grid min-h-40 place-items-center border-2 border-dashed p-4 text-center transition ${
            dragActive ? "border-black bg-zinc-100" : "border-zinc-300 bg-zinc-50"
          }`}
        >
          <div>
            <p className="text-base font-black">Arrastra imagenes o seleccionalas desde galeria</p>
            <p className="mt-1 text-sm font-semibold text-zinc-500">{images.length}/{MAX_IMAGES} imagenes agregadas</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving || images.length >= MAX_IMAGES}
              className="mt-4 h-12 bg-black px-5 text-sm font-black text-white disabled:opacity-50"
            >
              Seleccionar imagenes
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileInput}
          />
        </div>

        <button
          type="button"
          disabled
          className="h-11 border border-dashed border-zinc-300 text-sm font-black text-zinc-400"
        >
          Optimizar imagenes con IA
        </button>

        {images.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {orderImages(images).map((image, index) => (
              <article key={image.id} className="border border-zinc-200 bg-white p-2">
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.previewUrl} alt={image.file.name} className="h-full w-full object-cover" />
                  {image.isPrimary ? (
                    <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[10px] font-black text-white">
                      Principal
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 grid gap-2">
                  <button type="button" onClick={() => setPrimary(image.id)} className="h-9 bg-black text-xs font-black text-white">
                    Usar como principal
                  </button>
                  <div className="grid grid-cols-3 gap-1">
                    <button type="button" onClick={() => moveImage(image.id, -1)} disabled={index === 0} className="h-9 bg-zinc-100 text-xs font-black disabled:opacity-40">
                      Subir
                    </button>
                    <button type="button" onClick={() => moveImage(image.id, 1)} disabled={index === images.length - 1} className="h-9 bg-zinc-100 text-xs font-black disabled:opacity-40">
                      Bajar
                    </button>
                    <button type="button" onClick={() => removeImage(image.id)} className="h-9 bg-red-50 text-xs font-black text-red-700">
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">Carga rapida</p>
          <h1 className="text-3xl font-black">Crear producto</h1>
        </div>

        <Field label="Nombre">
          <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} placeholder="Ej: Vestido lino Brisa" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <CategoryPickers
            categories={categories}
            controlled
            requiredCategory
            categoryId={categoryId}
            subcategoryId={advanced.subcategoryId}
            onCategoryChange={setCategoryId}
            onSubcategoryChange={(value) => setAdvancedValue("subcategoryId", value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio">
            <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" inputMode="numeric" min="0" className={inputClass} />
          </Field>
          <Field label="Precio anterior opcional">
            <input value={previousPrice} onChange={(event) => setPreviousPrice(event.target.value)} type="number" inputMode="numeric" min="0" className={inputClass} />
          </Field>
        </div>

        {discountPercent ? (
          <p className="bg-amber-50 p-3 text-sm font-black text-amber-800">
            Descuento calculado automaticamente: -{discountPercent}%
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Inventario">
            <input value={inventory} onChange={(event) => setInventory(event.target.value)} type="number" inputMode="numeric" min="0" className={inputClass} />
          </Field>
          <Field label="Estado">
            <select value={status} onChange={(event) => setStatus(event.target.value as Status)} className={inputClass}>
              <option value="hidden">Oculto</option>
              <option value="active">Publicado</option>
            </select>
            <span className="text-xs font-bold text-zinc-500">
              Oculto solo queda en admin. Publicado aparece en la tienda.
            </span>
          </Field>
        </div>

        <details open={showAdvanced} onToggle={(event) => setShowAdvanced(event.currentTarget.open)} className="border border-zinc-200">
          <summary className="cursor-pointer bg-zinc-50 px-4 py-3 text-sm font-black">Opciones avanzadas</summary>
          <div className="grid gap-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug manual">
                <input value={advanced.slug} onChange={(event) => setAdvancedValue("slug", event.target.value)} className={inputClass} placeholder={generatedSlug} />
              </Field>
              <Field label="SKU manual">
                <input value={advanced.sku} onChange={(event) => setAdvancedValue("sku", event.target.value)} className={inputClass} placeholder={skuPreview} />
              </Field>
              <Field label="Coleccion">
                <input value={advanced.collection} onChange={(event) => setAdvancedValue("collection", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Orden">
                <input value={advanced.displayOrder} onChange={(event) => setAdvancedValue("displayOrder", event.target.value)} type="number" className={inputClass} />
              </Field>
            </div>
            <Field label="Descripcion corta">
              <textarea value={advanced.shortDescription} onChange={(event) => setAdvancedValue("shortDescription", event.target.value)} rows={3} className={textareaClass} />
            </Field>
            <Field label="Descripcion completa">
              <textarea value={advanced.description} onChange={(event) => setAdvancedValue("description", event.target.value)} rows={5} className={textareaClass} />
            </Field>
            <Field label="Etiquetas separadas por coma">
              <input value={advanced.tags} onChange={(event) => setAdvancedValue("tags", event.target.value)} className={inputClass} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <CheckField label="Destacado" checked={advanced.isFeatured} onChange={(checked) => setAdvancedValue("isFeatured", checked)} />
              <CheckField label="Nuevo" checked={advanced.isNew} onChange={(checked) => setAdvancedValue("isNew", checked)} />
              <CheckField label="En oferta" checked={advanced.isPromo} onChange={(checked) => setAdvancedValue("isPromo", checked)} />
            </div>
          </div>
        </details>

        {progress ? <p className="bg-zinc-100 p-3 text-sm font-black">{progress}</p> : null}
        {message ? (
          <div className={`${message.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"} p-3 text-sm font-bold`}>
            <p>{message.text}</p>
            {message.productId ? (
              <a href={`/admin/productos/${message.productId}/editar`} className="mt-2 inline-block underline">
                Abrir producto guardado
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={saving} onClick={() => save("status")} className="h-12 bg-black px-4 text-sm font-black text-white disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
          <button type="button" disabled={saving} onClick={() => save("another")} className="h-12 border border-black px-4 text-sm font-black text-black disabled:opacity-50">
            Guardar y crear otro
          </button>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 shadow-[0_-14px_40px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3">
          <button type="button" disabled={saving} onClick={() => save("draft")} className="h-12 border border-black text-sm font-black text-black disabled:opacity-50">
            Guardar borrador
          </button>
          <button type="button" disabled={saving} onClick={() => save("publish")} className="h-12 bg-black text-sm font-black text-white disabled:opacity-50">
            Publicar
          </button>
        </div>
      </div>
    </div>
  );

  function setAdvancedValue<Key extends keyof typeof initialAdvanced>(key: Key, value: (typeof initialAdvanced)[Key]) {
    setAdvanced((current) => ({ ...current, [key]: value }));
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
    </label>
  );
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center gap-3 bg-zinc-50 px-3 text-sm font-bold">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

const inputClass = "h-12 w-full border border-zinc-300 px-3 text-base focus:border-black";
const textareaClass = "w-full border border-zinc-300 px-3 py-3 text-base focus:border-black";

function ensurePrimary(images: LocalImage[]) {
  if (!images.length || images.some((image) => image.isPrimary)) return images;
  return images.map((image, index) => ({ ...image, isPrimary: index === 0 }));
}

function orderImages(images: LocalImage[]) {
  return [...images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
}

function buildSku(name: string) {
  const base = slugify(name).replace(/-/g, "").slice(0, 8).toUpperCase() || "PROD";
  return `ATRES-${base}-${Date.now().toString().slice(-5)}`;
}

function buildSkuPreview(name: string) {
  const base = slugify(name).replace(/-/g, "").slice(0, 8).toUpperCase() || "PROD";
  return `ATRES-${base}-AUTO`;
}

function uniqueSlug(slug: string) {
  return `${slug || "producto"}-${Date.now().toString().slice(-5)}`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function normalizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const ratio = 3 / 4;
  const sourceRatio = bitmap.width / bitmap.height;
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;

  if (sourceRatio > ratio) {
    sw = bitmap.height * ratio;
    sx = (bitmap.width - sw) / 2;
  } else {
    sh = bitmap.width / ratio;
    sy = (bitmap.height - sh) / 2;
  }

  const width = Math.min(1200, sw);
  const height = Math.round(width / ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo preparar la imagen.");

  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo convertir la imagen."));
      },
      "image/webp",
      0.84,
    );
  });
}
