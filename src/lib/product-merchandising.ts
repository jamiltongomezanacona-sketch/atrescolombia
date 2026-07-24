import { getDiscountPercent, type Product } from "@/lib/store-data";

type CommercialTone = "dark" | "sale" | "new" | "trend" | "stock" | "soft";

const TECHNICAL_PREFIXES = ["badge", "etiqueta", "copy", "linea", "tone", "tono", "rank", "ranking"];

export function getCommercialBadge(product: Product) {
  const custom = getTaggedValue(product, ["badge", "etiqueta"]);
  if (custom) return custom;

  const discount = getDiscountPercent(product);
  if (discount && discount >= 30) return "Mega oferta";
  if (discount && discount >= 15) return "Precio wow";
  if (product.isPromo || discount) return "Oferta flash";
  if (product.stock > 0 && product.stock <= 3) return "Ultimas piezas";
  if (product.isNew && product.isTrending) return "Nuevo top";
  if (product.isNew) return "Nuevo";
  if (product.isTrending) return "Destacado";
  if (product.badge === "Oferta") return "Precio wow";
  if (product.badge === "Nuevo") return "Nuevo";
  if (product.badge === "Tendencia" || product.badge === "Top") return "Destacado";
  return product.badge;
}

export function getCommercialTone(product: Product): CommercialTone {
  const customTone = getTaggedValue(product, ["tone", "tono"])?.toLowerCase();
  if (customTone === "rojo" || customTone === "sale") return "sale";
  if (customTone === "nuevo" || customTone === "new") return "new";
  if (customTone === "trend" || customTone === "tendencia") return "trend";
  if (customTone === "stock" || customTone === "pocas") return "stock";
  if (customTone === "suave" || customTone === "soft") return "soft";

  const discount = getDiscountPercent(product);
  if (discount || product.isPromo) return "sale";
  if (product.stock > 0 && product.stock <= 3) return "stock";
  if (product.isNew) return "new";
  if (product.isTrending) return "trend";
  return "dark";
}

export function getCommercialMeta(product: Product) {
  const custom = getTaggedValue(product, ["copy", "linea"]);
  if (custom) return custom;

  if (product.isTrending) return "favorito ATRES";
  if (product.isNew) return "recien llegado";
  if (product.isPromo) return "precio especial";
  if (product.stock > 0 && product.stock <= 3) return "pocas piezas";
  return "en vitrina";
}

export function getCommercialLine(product: Product, inStock: boolean) {
  const custom = getTaggedValue(product, ["copy", "linea"]);
  if (custom) return custom;
  if (!inStock) return "Pide disponibilidad por WhatsApp";

  const key = `${product.categorySlug} ${product.categoryName} ${product.collection}`.toLowerCase();

  if (product.isPromo) return "Precio especial en la vitrina";
  if (product.isNew) return "Nuevo drop listo para estrenar";
  if (key.includes("hogar") || key.includes("textil") || key.includes("sabana") || key.includes("cobija")) {
    return "Texturas suaves para renovar casa";
  }
  if (key.includes("infantil") || key.includes("nino") || key.includes("nina") || key.includes("bebe")) {
    return "Looks comodos para todos los dias";
  }
  if (key.includes("mujer") || key.includes("femenin")) {
    return "Una pieza facil para elevar el look";
  }
  if (key.includes("hombre") || key.includes("masculin")) {
    return "Basico versatil con estilo limpio";
  }

  return "Seleccion ATRES lista para comprar";
}

export function getTopRibbon(product: Product) {
  const custom = getTaggedValue(product, ["rank", "ranking"]);
  if (custom) return custom;

  const discount = getDiscountPercent(product);
  const savings = product.previousPrice && product.previousPrice > product.price
    ? product.previousPrice - product.price
    : 0;

  if (savings >= 5000) return `Ahorra ${formatShortCOP(savings)}`;
  if (discount && discount >= 20) return `Oferta top -${discount}%`;
  if (product.isTrending) return "Destacado";
  return null;
}

export function getVisibleProductDetails(product: Product) {
  const details = product.details.filter((detail) => !isTechnicalTag(detail));
  return details.length ? details : ["Producto ATRES", "Disponible en tienda"];
}

export function getToneClass(tone: CommercialTone) {
  const tones: Record<CommercialTone, string> = {
    dark: "bg-black/82 text-white ring-white/15",
    sale: "bg-[#ff4d00] text-[#f0d48a] ring-[#f0d48a]/30",
    new: "bg-[#111827] text-white ring-white/15",
    trend: "bg-[#5b2bd6] text-white ring-white/15",
    stock: "bg-[#f7b500] text-black ring-black/10",
    soft: "bg-white/90 text-black ring-black/10",
  };

  return tones[tone];
}

function getTaggedValue(product: Product, keys: string[]) {
  for (const detail of product.details) {
    const [rawKey, ...rest] = detail.split(":");
    if (!rawKey || !rest.length) continue;
    const key = normalizeKey(rawKey);
    if (keys.map(normalizeKey).includes(key)) {
      return rest.join(":").trim();
    }
  }
  return null;
}

function isTechnicalTag(detail: string) {
  const [rawKey, ...rest] = detail.split(":");
  if (!rawKey || !rest.length) return false;
  return TECHNICAL_PREFIXES.includes(normalizeKey(rawKey));
}

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatShortCOP(value: number) {
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}
