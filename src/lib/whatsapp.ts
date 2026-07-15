export function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const digits = normalizeWhatsappNumber(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(
  product: {
    name: string;
    slug: string;
    price: number;
  },
  size?: string,
  color?: string,
) {
  const lines = [
    "Hola ATRES, quiero informacion de este producto:",
    product.name,
    `Precio: $${product.price.toLocaleString("es-CO")}`,
  ];

  if (color) lines.push(`Color: ${color}`);
  if (size) lines.push(`Talla: ${size}`);
  lines.push(`Link: https://atrescolombia.com/productos/${product.slug}`);

  return lines.join("\n");
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
