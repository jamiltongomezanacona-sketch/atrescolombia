import type { ShopCardModel } from "@/components/shops/shop-card";

export type ShopBadgeKind =
  | "verified"
  | "top"
  | "shipping"
  | "maker"
  | "premium"
  | "new"
  | "featured"
  | "offer"
  | "wholesale"
  | "today";

export type ShopBadge = {
  kind: ShopBadgeKind;
  label: string;
};

const DEMO_BADGE_MAP: Record<string, ShopBadge> = {
  "top ventas": { kind: "top", label: "Top ventas" },
  "envio gratis": { kind: "shipping", label: "Envio gratis" },
  "envío gratis": { kind: "shipping", label: "Envio gratis" },
  fabricante: { kind: "maker", label: "Fabricante" },
  premium: { kind: "premium", label: "Premium" },
  nuevo: { kind: "new", label: "Nueva" },
  nueva: { kind: "new", label: "Nueva" },
  destacada: { kind: "featured", label: "Destacada" },
  "oferta activa": { kind: "offer", label: "Oferta" },
  mayorista: { kind: "wholesale", label: "Mayorista" },
  "entrega hoy": { kind: "today", label: "Entrega hoy" },
};

/** Presentation-only: derive badges from existing shop fields (no DB writes). */
export function getShopBadges(shop: ShopCardModel): ShopBadge[] {
  const badges: ShopBadge[] = [];

  if (shop.verified) {
    badges.push({ kind: "verified", label: "Verificada" });
  }

  const demoMatch = shop.description?.match(/Insignia demo:\s*([^.]+)/i);
  if (demoMatch?.[1]) {
    const key = demoMatch[1].trim().toLowerCase();
    const mapped = DEMO_BADGE_MAP[key];
    if (mapped && !badges.some((badge) => badge.kind === mapped.kind)) {
      badges.push(mapped);
    }
  }

  if (shop.localDeliveryEnabled && !badges.some((badge) => badge.kind === "today")) {
    // Keep compact: only add shipping if not already marked
  }

  return badges.slice(0, 3);
}

/** Presentation-only compact meta chips from existing fields. */
export function getShopQuickMeta(shop: ShopCardModel): string[] {
  const chips: string[] = [];
  const count = shop.productCount ?? 0;
  if (count > 0) chips.push(`${count} productos`);

  const responseMatch = shop.description?.match(/Respuesta(?: típica| promedio)?(?: en)?\s*(?:~|menos de\s*)?(\d+\s*min)/i);
  if (responseMatch?.[1]) {
    chips.push(`Responde en ${responseMatch[1].replace(/\s+/g, " ")}`);
  }

  if (shop.localDeliveryEnabled) chips.push("Local");
  else if (shop.deliveryRadiusKm != null || shop.pickupEnabled) chips.push("Nacional");

  return chips.slice(0, 3);
}

export function getShopCategoryLabel(shop: ShopCardModel): string {
  const fromShort = shop.shortDescription?.split("·")[0]?.trim();
  if (fromShort && fromShort.length < 40) return fromShort;
  return shop.categoryLabel?.trim() || "";
}

export function buildShopWhatsappHref(whatsapp: string | null | undefined): string | null {
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}`;
}

export function buildShopsPageStats(shops: ShopCardModel[]) {
  const verified = shops.filter((shop) => shop.verified).length;
  const products = shops.reduce((sum, shop) => sum + (shop.productCount ?? 0), 0);
  const national = shops.filter((shop) => shop.localDeliveryEnabled || shop.pickupEnabled).length > 0;

  return {
    total: shops.length,
    verified,
    products,
    national,
  };
}
