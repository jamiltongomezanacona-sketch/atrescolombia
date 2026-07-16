"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AdminProductImage } from "@/lib/admin/types";

type ImageManagerProps = {
  productId: string;
  images: AdminProductImage[];
};

const MAX_IMAGES = 8;
const MAX_SIZE = 8 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 900 * 1024;
const QUALITY_STEPS = [0.82, 0.76, 0.68, 0.6];

export function ImageManager({ productId, images }: ImageManagerProps) {
  const [items, setItems] = useState(images);
  const [message, setMessage] = useState("");
  const [uploading, startUpload] = useTransition();
  const [aspectRatio, setAspectRatio] = useState("3:4");
  const [rotation, setRotation] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const canUploadMore = items.length < MAX_IMAGES;

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.display_order - b.display_order),
    [items],
  );

  async function onFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setMessage("");
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));

    if (!files.length) return;
    if (items.length + files.length > MAX_IMAGES) {
      setMessage(`Maximo ${MAX_IMAGES} imagenes por producto.`);
      return;
    }

    startUpload(async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const uploaded: AdminProductImage[] = [];

        for (const file of files) {
          if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            throw new Error("Solo se permiten JPG, PNG o WebP.");
          }
          if (file.size > MAX_SIZE) {
            throw new Error("Cada imagen original debe pesar maximo 8MB.");
          }

          const webp = await normalizeImage(file, aspectRatio, rotation);
          if (webp.size > MAX_UPLOAD_SIZE) {
            throw new Error("La imagen optimizada sigue superando 900KB. Usa una foto mas liviana.");
          }
          const path = `products/${productId}/${crypto.randomUUID()}.webp`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(path, webp, { contentType: "image/webp", upsert: false });

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(path);
          const { data, error } = await supabase
            .from("product_images")
            .insert({
              product_id: productId,
              storage_path: path,
              public_url: publicUrlData.publicUrl,
              alt: file.name,
              aspect_ratio: aspectRatio,
              display_order: items.length + uploaded.length + 1,
              is_primary: items.length === 0 && uploaded.length === 0,
            })
            .select("*")
            .single();

          if (error) throw error;
          uploaded.push(data as AdminProductImage);
        }

        setItems((current) => [...current, ...uploaded]);
        setMessage("Imagenes subidas correctamente.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No se pudieron subir las imagenes.");
      }
    });
  }

  async function deleteImage(image: AdminProductImage) {
    if (!window.confirm("Eliminar esta imagen?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.storage.from("product-images").remove([image.storage_path]);
    const { error } = await supabase.from("product_images").delete().eq("id", image.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((current) => current.filter((item) => item.id !== image.id));
  }

  async function setPrimary(image: AdminProductImage) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", image.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, is_primary: item.id === image.id })));
  }

  async function moveImage(image: AdminProductImage, direction: -1 | 1) {
    const ordered = [...sortedItems];
    const index = ordered.findIndex((item) => item.id === image.id);
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= ordered.length) return;
    [ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]];
    const supabase = createSupabaseBrowserClient();
    const updates = ordered.map((item, index) =>
      supabase.from("product_images").update({ display_order: index + 1 }).eq("id", item.id),
    );
    await Promise.all(updates);
    setItems(ordered.map((item, index) => ({ ...item, display_order: index + 1 })));
  }

  return (
    <div className="grid gap-4 rounded-2xl bg-white/95 p-4 shadow-sm ring-1 ring-black/5 md:p-5">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Galeria</p>
        <h2 className="mt-1 text-xl font-black">Imagenes del producto</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-500">
          1 a 8 imagenes. Maximo 8MB cada una; se guardan optimizadas en WebP.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold">
          Proporcion
          <select
            value={aspectRatio}
            onChange={(event) => setAspectRatio(event.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3"
          >
            <option value="3:4">3:4 catalogo</option>
            <option value="1:1">1:1 miniatura</option>
            <option value="16:9">16:9 banner</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Rotacion
          <select
            value={rotation}
            onChange={(event) => setRotation(Number(event.target.value))}
            className="h-11 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3"
          >
            <option value={0}>0 grados</option>
            <option value={90}>90 grados</option>
            <option value={180}>180 grados</option>
            <option value={270}>270 grados</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Subir imagenes
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={!canUploadMore || uploading}
            onChange={onFilesSelected}
            className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
          />
        </label>
      </div>

      {previewUrls.length ? (
        <div className="grid grid-cols-4 gap-2">
          {previewUrls.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100">
              <Image src={url} alt="Vista previa" fill unoptimized sizes="120px" className="object-cover" />
            </div>
          ))}
        </div>
      ) : null}

      {message ? <p className="rounded-xl bg-zinc-100 p-3 text-sm font-bold">{message}</p> : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {sortedItems.map((image, index) => (
          <article key={image.id} className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-zinc-100">
              <Image src={image.public_url} alt={image.alt || "Producto"} fill sizes="180px" className="object-cover" />
            </div>
            <div className="mt-2 grid gap-2">
              {image.is_primary ? <p className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Principal</p> : null}
              <div className="grid grid-cols-2 gap-1">
                <button onClick={() => moveImage(image, -1)} disabled={index === 0} className="min-h-10 rounded-full bg-zinc-100 px-2 py-1 text-xs font-black disabled:opacity-40">
                  Subir
                </button>
                <button onClick={() => moveImage(image, 1)} disabled={index === sortedItems.length - 1} className="min-h-10 rounded-full bg-zinc-100 px-2 py-1 text-xs font-black disabled:opacity-40">
                  Bajar
                </button>
              </div>
              <button onClick={() => setPrimary(image)} className="min-h-10 rounded-full bg-black px-2 py-1 text-xs font-black text-white">
                Principal
              </button>
              <button onClick={() => deleteImage(image)} className="min-h-10 rounded-full bg-red-50 px-2 py-1 text-xs font-black text-red-700">
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

async function normalizeImage(file: File, aspectRatio: string, rotation: number) {
  const bitmap = await createImageBitmap(file);
  const ratio = aspectRatio === "1:1" ? 1 : aspectRatio === "16:9" ? 16 / 9 : 3 / 4;
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

  const maxWidth = aspectRatio === "16:9" ? 1600 : 1200;
  for (const targetWidth of [Math.min(maxWidth, sw), 1080, 960, 840]) {
    const width = Math.round(targetWidth);
    const height = Math.round(width / ratio);
    const canvas = document.createElement("canvas");
    const rotated = rotation === 90 || rotation === 270;
    canvas.width = rotated ? height : width;
    canvas.height = rotated ? width : height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo preparar la imagen.");

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(bitmap, sx, sy, sw, sh, -width / 2, -height / 2, width, height);

    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToWebp(canvas, quality);
      if (blob.size <= MAX_UPLOAD_SIZE || targetWidth === 840) {
        return blob;
      }
    }
  }

  throw new Error("No se pudo optimizar la imagen.");
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo convertir la imagen."));
    }, "image/webp", quality);
  });
}
