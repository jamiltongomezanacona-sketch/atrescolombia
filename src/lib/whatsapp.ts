/** Fallback used when store_settings.whatsapp is empty (matches public floating CTA). */
export const DEFAULT_STORE_WHATSAPP = "573232122486";

export function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function resolveStoreWhatsapp(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || DEFAULT_STORE_WHATSAPP;
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = normalizeWhatsappNumber(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(
  product: {
    name: string;
    slug?: string;
    price: number | string;
    sku?: string;
    id?: string;
  },
  size?: string,
  color?: string,
  options?: {
    productUrl?: string;
    reference?: string;
  },
) {
  const productUrl = options?.productUrl ?? (
    product.slug ? `https://atrescolombia.com/productos/${product.slug}` : "https://atrescolombia.com/productos"
  );
  const reference = cleanField(options?.reference) || cleanField(product.sku) || cleanField(product.id);
  const productColor = cleanField(color);
  const productSize = cleanField(size);
  const sections = [
    "👋 Hola ATRES.",
    "Me interesa esta prenda y quisiera más información.",
    `🛍 Producto:\n${product.name}`,
    `💲 Precio:\n${formatProductPrice(product.price)}`,
  ];

  if (productColor) sections.push(`🎨 Color:\n${productColor}`);
  if (productSize) sections.push(`📏 Talla:\n${productSize}`);
  if (reference) sections.push(`🆔 Referencia:\n${reference}`);

  sections.push(`🔗 Ver producto:\n${productUrl}`, "Muchas gracias.");

  return sections.join("\n\n");
}

export function buildCartWhatsAppMessage(
  items: Array<{ name: string; quantity: number; color: string; size: string; price: number }>,
  subtotal: number,
) {
  const lines = ["Hola ATRES, quiero confirmar esta compra:"];

  for (const item of items) {
    lines.push(
      `- ${item.name} x${item.quantity} (${item.color}/${item.size}) $${(item.price * item.quantity).toLocaleString("es-CO")}`,
    );
  }

  lines.push(`Subtotal: $${subtotal.toLocaleString("es-CO")}`);
  return lines.join("\n");
}

function cleanField(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  const normalized = trimmed
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized === "unico" || normalized === "unica") return "";
  return trimmed;
}

function formatProductPrice(value: number | string) {
  if (typeof value === "string") return value.trim();
  return `$${value.toLocaleString("es-CO")}`;
}
