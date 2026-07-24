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
    <section className="theme-panel grid gap-4 rounded-2xl p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="theme-kicker">Variantes</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-ink">Colores y tallas</h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-ink-muted">
            Activa esta opcion solo cuando una misma prenda tenga inventario por color o talla.
          </p>
        </div>
        <label className="flex min-h-11 items-center gap-3 rounded-full border border-[var(--border-gold-soft)] bg-black-main/40 px-4 text-sm font-black text-gold-light">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="size-4 accent-gold"
          />
          Usar variantes
        </label>
      </div>

      {!enabled ? (
        <p className="theme-muted-panel rounded-xl p-3 text-sm font-semibold text-ink-muted">
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

          <div className="theme-muted-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-3">
            <div className="text-sm font-bold text-gold-light">
              {variants.length} variantes · {inventoryTotal} unidades totales
            </div>
            <button
              type="button"
              onClick={generateVariants}
              className="theme-primary-button h-11 rounded-full px-5 text-sm font-black"
            >
              Generar combinaciones
            </button>
          </div>

          {variants.length ? (
            <div className="grid gap-2">
              <div className="hidden grid-cols-[1.05fr_0.75fr_0.75fr_1.2fr_0.9fr_1fr_44px] gap-2 px-2 text-[11px] font-black uppercase tracking-wide text-ink-muted lg:grid">
                <span>Color</span>
                <span>Talla</span>
                <span>Stock</span>
                <span>SKU</span>
                <span>Precio</span>
                <span>Estado</span>
                <span />
              </div>
              {variants.map((variant, index) => (
                <article key={`${variant.color}-${variant.size}-${index}`} className="theme-muted-panel grid gap-2 rounded-2xl p-3 lg:grid-cols-[1.05fr_0.75fr_0.75fr_1.2fr_0.9fr_1fr_44px] lg:items-center">
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
                    className="theme-danger-button h-10 rounded-full px-3 text-xs font-black lg:size-10 lg:px-0"
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
                className="theme-primary-button h-12 rounded-full px-5 text-sm font-black disabled:opacity-50"
              >
                {isPending ? "Guardando..." : "Guardar variantes"}
              </button>
              {message ? (
                <p className={`rounded-full px-4 py-2 text-sm font-bold ${message.type === "ok" ? "theme-ok" : "theme-error"}`}>
                  {message.text}
                </p>
              ) : null}
            </div>
          ) : message ? (
            <p className={`rounded-xl p-3 text-sm font-bold ${message.type === "ok" ? "theme-ok" : "theme-error"}`}>
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
    <div className="theme-muted-panel grid gap-3 rounded-2xl p-3">
      <p className="text-sm font-black text-gold-light">{label}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onAdd(item)}
            className="min-h-9 rounded-full border border-white/10 bg-black-main/50 px-3 text-xs font-black transition hover:border-[var(--border-gold-soft)] hover:text-gold-light"
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
        <button type="button" onClick={() => onAdd(inputValue)} className="theme-primary-button rounded-full px-4 text-sm font-black">
          Agregar
        </button>
      </div>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((item) => (
            <span key={item} className="inline-flex items-center gap-2 rounded-full bg-black-main/50 px-3 py-2 text-xs font-black text-ink ring-1 ring-white/10">
              {label === "Colores" ? <span className="size-3 rounded-full ring-1 ring-white/20" style={{ backgroundColor: colorToHex(item) }} /> : null}
              {item}
              <button type="button" onClick={() => onRemove(item)} className="text-ink-muted hover:text-red-400" aria-label={`Quitar ${item}`}>
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
    <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-ink-muted lg:block">
      <span className="lg:hidden">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "theme-field h-11 w-full rounded-xl px-3 text-sm font-bold";

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
  if (key.includes("negro")) return "var(--swatch-black)";
  if (key.includes("blanco")) return "var(--swatch-white)";
  if (key.includes("azul")) return "var(--swatch-blue)";
  if (key.includes("ros")) return "var(--swatch-pink)";
  if (key.includes("beige")) return "var(--swatch-beige)";
  if (key.includes("rojo")) return "var(--swatch-red)";
  if (key.includes("verde")) return "var(--swatch-green)";
  if (key.includes("morado")) return "var(--swatch-lilac)";
  if (key.includes("denim")) return "var(--swatch-denim)";
  return "var(--swatch-default)";
}
