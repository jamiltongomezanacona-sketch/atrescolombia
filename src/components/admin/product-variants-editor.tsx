"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { saveProductVariants } from "@/lib/admin/actions";
import type { ProductVariantInput } from "@/lib/admin/actions";
import type { AdminProductVariant, ProductVariantStatus } from "@/lib/admin/types";

export type ProductVariantsEditorValue = {
  enabled: boolean;
  variants: ProductVariantInput[];
  inventoryTotal: number;
};

type ProductVariantsEditorProps = {
  productId?: string;
  baseSku: string;
  basePrice: number;
  initialVariants?: AdminProductVariant[];
  onChange?: (value: ProductVariantsEditorValue) => void;
};

const SIZES = ["2", "4", "6", "8", "10", "12", "XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Azul", "Negro", "Blanco", "Rosado", "Beige", "Rojo", "Verde", "Morado", "Denim"];
const STATUS_OPTIONS: Array<{ value: ProductVariantStatus; label: string }> = [
  { value: "available", label: "Disponible" },
  { value: "sold_out", label: "Agotado" },
  { value: "hidden", label: "Oculto" },
  { value: "coming_soon", label: "Proximamente" },
];

export function ProductVariantsEditor({
  productId,
  baseSku,
  basePrice,
  initialVariants = [],
  onChange,
}: ProductVariantsEditorProps) {
  const [enabled, setEnabled] = useState(initialVariants.length > 0);
  const [colors, setColors] = useState(() => unique(initialVariants.map((variant) => variant.color)));
  const [sizes, setSizes] = useState(() => unique(initialVariants.map((variant) => variant.size)));
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [variants, setVariants] = useState<ProductVariantInput[]>(() =>
    initialVariants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      inventory: variant.inventory,
      price: variant.price,
      status: variant.status,
    })),
  );
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const inventoryTotal = useMemo(
    () => variants.reduce((total, variant) => total + Math.max(0, Math.round(Number(variant.inventory) || 0)), 0),
    [variants],
  );

  useEffect(() => {
    onChange?.({ enabled, variants: enabled ? variants : [], inventoryTotal });
  }, [enabled, inventoryTotal, onChange, variants]);

  function addColor(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    setColors((current) => unique([...current, normalized]));
    setColorInput("");
  }

  function addSize(value: string) {
    const normalized = value.trim().toUpperCase();
    if (!normalized) return;
    setSizes((current) => unique([...current, normalized]));
    setSizeInput("");
  }

  function removeColor(value: string) {
    setColors((current) => current.filter((item) => item !== value));
    setVariants((current) => current.filter((variant) => variant.color !== value));
  }

  function removeSize(value: string) {
    setSizes((current) => current.filter((item) => item !== value));
    setVariants((current) => current.filter((variant) => variant.size !== value));
  }

  function generateVariants() {
    setMessage(null);
    if (!colors.length || !sizes.length) {
      setMessage({ type: "error", text: "Agrega al menos un color y una talla." });
      return;
    }

    setVariants((current) => {
      const currentByKey = new Map(current.map((variant) => [variantKey(variant.color, variant.size), variant]));
      return colors.flatMap((color) =>
        sizes.map((size, index) => {
          const existing = currentByKey.get(variantKey(color, size));
          return existing ?? {
            color,
            size,
            inventory: 1,
            price: basePrice > 0 ? basePrice : null,
            status: "available" as ProductVariantStatus,
            sku: buildVariantSku(baseSku, color, size, index),
          };
        }),
      );
    });
  }

  function updateVariant(index: number, patch: Partial<ProductVariantInput>) {
    setVariants((current) => current.map((variant, currentIndex) => (currentIndex === index ? { ...variant, ...patch } : variant)));
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function saveEditVariants() {
    if (!productId) return;
    setMessage(null);
    startTransition(async () => {
      const result = await saveProductVariants(productId, variants);
      setMessage({ type: result.ok ? "ok" : "error", text: result.message });
    });
  }

  return (
    <section className="grid gap-4 rounded-2xl border border-[#c7ddf2] bg-white/95 p-4 shadow-sm ring-1 ring-white/70 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-[#2f6f9f]">Variantes</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950">Colores y tallas</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-zinc-500">
            Activa esta opcion solo cuando una misma prenda tenga inventario por color o talla.
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-3 rounded-full border border-[#d8e7f5] bg-[#eef6ff] px-4 text-sm font-black text-[#0b1f3a]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="size-4 accent-black"
          />
          Usar variantes
        </label>
      </div>

      {!enabled ? (
        <p className="rounded-xl bg-[#f5f9ff] p-3 text-sm font-semibold text-zinc-500">
          Producto simple activo: se conserva el inventario principal actual.
        </p>
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <VariantPicker
              label="Colores"
              values={colors}
              suggestions={COLORS}
              inputValue={colorInput}
              placeholder="Ej: Azul cielo"
              onInputChange={setColorInput}
              onAdd={addColor}
              onRemove={removeColor}
            />
            <VariantPicker
              label="Tallas"
              values={sizes}
              suggestions={SIZES}
              inputValue={sizeInput}
              placeholder="Ej: 14"
              onInputChange={setSizeInput}
              onAdd={addSize}
              onRemove={removeSize}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#eef6ff]/80 p-3">
            <div className="text-sm font-bold text-[#0b1f3a]">
              {variants.length} variantes · {inventoryTotal} unidades totales
            </div>
            <button
              type="button"
              onClick={generateVariants}
              className="h-11 rounded-full bg-[#0b1f3a] px-5 text-sm font-black text-white transition hover:bg-black"
            >
              Generar combinaciones
            </button>
          </div>

          {variants.length ? (
            <div className="grid gap-2">
              <div className="hidden grid-cols-[1.05fr_0.75fr_0.75fr_1.2fr_0.9fr_1fr_44px] gap-2 px-2 text-[11px] font-black uppercase tracking-wide text-zinc-500 lg:grid">
                <span>Color</span>
                <span>Talla</span>
                <span>Stock</span>
                <span>SKU</span>
                <span>Precio</span>
                <span>Estado</span>
                <span />
              </div>
              {variants.map((variant, index) => (
                <article key={`${variant.color}-${variant.size}-${index}`} className="grid gap-2 rounded-2xl border border-[#d8e7f5] bg-white p-3 lg:grid-cols-[1.05fr_0.75fr_0.75fr_1.2fr_0.9fr_1fr_44px] lg:items-center">
                  <InlineLabel label="Color">
                    <input
                      value={variant.color}
                      onChange={(event) => updateVariant(index, { color: event.target.value })}
                      className={inputClass}
                    />
                  </InlineLabel>
                  <InlineLabel label="Talla">
                    <input
                      value={variant.size}
                      onChange={(event) => updateVariant(index, { size: event.target.value.toUpperCase() })}
                      className={inputClass}
                    />
                  </InlineLabel>
                  <InlineLabel label="Stock">
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={variant.inventory}
                      onChange={(event) => updateVariant(index, { inventory: Number(event.target.value) || 0 })}
                      className={inputClass}
                    />
                  </InlineLabel>
                  <InlineLabel label="SKU">
                    <input
                      value={variant.sku}
                      onChange={(event) => updateVariant(index, { sku: event.target.value.toUpperCase() })}
                      className={inputClass}
                    />
                  </InlineLabel>
                  <InlineLabel label="Precio">
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={variant.price ?? ""}
                      placeholder={basePrice ? String(basePrice) : "Base"}
                      onChange={(event) => updateVariant(index, { price: event.target.value ? Number(event.target.value) : null })}
                      className={inputClass}
                    />
                  </InlineLabel>
                  <InlineLabel label="Estado">
                    <select
                      value={variant.status}
                      onChange={(event) => updateVariant(index, { status: event.target.value as ProductVariantStatus })}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </InlineLabel>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="h-10 rounded-full bg-red-50 px-3 text-xs font-black text-red-700 lg:size-10 lg:px-0"
                    aria-label="Eliminar variante"
                  >
                    X
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {productId ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveEditVariants}
                disabled={isPending || !variants.length}
                className="h-12 rounded-full bg-[#0b1f3a] px-5 text-sm font-black text-white disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar variantes"}
              </button>
              {message ? (
                <p className={`rounded-full px-4 py-2 text-sm font-bold ${message.type === "ok" ? "bg-[#eef6ff] text-[#0b1f3a]" : "bg-red-50 text-red-700"}`}>
                  {message.text}
                </p>
              ) : null}
            </div>
          ) : message ? (
            <p className={`rounded-xl p-3 text-sm font-bold ${message.type === "ok" ? "bg-[#eef6ff] text-[#0b1f3a]" : "bg-red-50 text-red-700"}`}>
              {message.text}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function VariantPicker({
  label,
  values,
  suggestions,
  inputValue,
  placeholder,
  onInputChange,
  onAdd,
  onRemove,
}: {
  label: string;
  values: string[];
  suggestions: string[];
  inputValue: string;
  placeholder: string;
  onInputChange: (value: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[#d8e7f5] bg-[#f5f9ff] p-3">
      <p className="text-sm font-black text-[#0b1f3a]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onAdd(item)}
            className="min-h-9 rounded-full border border-zinc-200 bg-white px-3 text-xs font-black transition hover:border-black"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd(inputValue);
            }
          }}
          placeholder={placeholder}
          className={inputClass}
        />
        <button type="button" onClick={() => onAdd(inputValue)} className="rounded-full bg-black px-4 text-sm font-black text-white">
          Agregar
        </button>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-zinc-900 ring-1 ring-zinc-200">
              {label === "Colores" ? <span className="size-3 rounded-full ring-1 ring-zinc-300" style={{ backgroundColor: colorToHex(item) }} /> : null}
              {item}
              <button type="button" onClick={() => onRemove(item)} className="text-zinc-400 hover:text-red-600" aria-label={`Quitar ${item}`}>
                x
              </button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function InlineLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-zinc-500 lg:block">
      <span className="lg:hidden">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-[#c7ddf2] bg-white px-3 text-sm font-bold text-zinc-950 outline-none transition focus:border-[#0b1f3a]";

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function variantKey(color: string, size: string) {
  return `${color.trim().toLowerCase()}::${size.trim().toLowerCase()}`;
}

function buildVariantSku(baseSku: string, color: string, size: string, index: number) {
  const base = baseSku.trim() || "ATRES";
  return `${base}-${shortCode(color)}-${shortCode(size)}-${index + 1}`.toUpperCase().replace(/[^A-Z0-9-]+/g, "-");
}

function shortCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4) || "VAR";
}

function colorToHex(value: string) {
  const key = value.toLowerCase();
  if (key.includes("negro")) return "#111111";
  if (key.includes("blanco")) return "#f8fafc";
  if (key.includes("azul")) return "#2563eb";
  if (key.includes("ros")) return "#f9a8d4";
  if (key.includes("beige")) return "#d6b98c";
  if (key.includes("rojo")) return "#dc2626";
  if (key.includes("verde")) return "#16a34a";
  if (key.includes("morado")) return "#8b5cf6";
  if (key.includes("denim")) return "#1e3a8a";
  return "#d4d4d8";
}
