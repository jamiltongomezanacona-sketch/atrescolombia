import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import type { PublicShop } from "@/lib/public-store";
import { ShopLocationButton } from "@/components/shops/shop-location-row";
import {
  buildShopWhatsappHref,
  getShopBadges,
  getShopCategoryLabel,
  getShopQuickMeta,
  type ShopBadge,
} from "@/lib/shop-card-presentation";

export type ShopCardModel = PublicShop & {
  imageUrl: string;
  categoryLabel?: string;
  distanceKm?: number | null;
};

type ShopCardProps = {
  shop: ShopCardModel;
  index?: number;
};

export function ShopCard({ shop, index = 0 }: ShopCardProps) {
  const shopName = shop.title || shop.name;
  const catalogHref = `/productos?tienda=${encodeURIComponent(shop.slug)}`;
  const profileHref = `/tiendas/${shop.slug}`;
  const mapsQuery = [shop.address, shop.neighborhood, shop.locality, shop.city, shop.department, shop.country]
    .filter(Boolean)
    .join(", ");
  const badges = getShopBadges(shop);
  const quickMeta = getShopQuickMeta(shop);
  const category = getShopCategoryLabel(shop);
  const whatsappHref = buildShopWhatsappHref(shop.whatsapp);
  const logoSrc = shop.logoUrl || shop.imageUrl;
  const delayMs = Math.min(index * 40, 320);

  return (
    <li
      className="shop-card-enter min-w-0"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <article className="store-card group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_18px_36px_rgba(0,0,0,0.38)]">
        <Link
          href={catalogHref}
          aria-label={`Ver catalogo de ${shopName}`}
          className="relative block aspect-[4/3] overflow-hidden bg-surface-muted/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <SafeProductImage
            src={shop.imageUrl}
            alt=""
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
            className="object-cover transition duration-200 ease-out group-hover:scale-[1.02]"
          />

          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent" />

          {logoSrc ? (
            <span className="absolute bottom-2 left-2 grid size-11 place-items-center overflow-hidden rounded-full bg-white shadow-[0_8px_18px_rgba(0,0,0,0.35)] ring-1 ring-black/10 sm:size-12">
              <SafeProductImage
                src={logoSrc}
                alt=""
                sizes="48px"
                className="object-cover"
              />
            </span>
          ) : null}

          {badges.length > 0 ? (
            <div className="absolute right-1.5 top-1.5 flex max-w-[70%] flex-wrap justify-end gap-1">
              {badges.map((badge) => (
                <ShopBadgePill key={badge.kind} badge={badge} />
              ))}
            </div>
          ) : null}
        </Link>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-2 pb-2 pt-2 sm:px-2.5 sm:pb-2.5">
          <div className="min-w-0">
            <h2 className="line-clamp-1 text-[12px] font-semibold leading-tight tracking-normal text-ink sm:text-[13px]">
              <Link
                href={catalogHref}
                className="transition-colors duration-200 hover:text-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {shopName}
              </Link>
            </h2>
            {category ? (
              <p className="mt-0.5 line-clamp-1 text-[10px] font-normal text-ink-muted sm:text-[11px]">
                {category}
              </p>
            ) : null}
          </div>

          {quickMeta.length > 0 ? (
            <p className="line-clamp-1 text-[10px] leading-4 text-ink-muted sm:text-[11px]">
              {quickMeta.join(" · ")}
            </p>
          ) : null}

          <p className="flex min-w-0 items-center gap-1 text-[10px] text-ink-muted sm:text-[11px]">
            <span className="inline-flex size-3.5 shrink-0 items-center justify-center text-ink/70" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="size-3 fill-none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span className="truncate font-medium text-ink/80">{shop.city || "Colombia"}</span>
            {shop.distanceKm != null ? (
              <span className="shrink-0 tabular-nums text-ink/60">· {shop.distanceKm.toFixed(1)} km</span>
            ) : null}
          </p>

          <div className="mt-auto flex items-center gap-1.5 pt-0.5">
            <Link
              href={catalogHref}
              className="theme-primary-button inline-flex h-8 min-h-8 flex-1 items-center justify-center rounded-full px-2.5 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98] sm:h-9 sm:min-h-9 sm:text-[11px]"
            >
              Ver catalogo
            </Link>

            <ShopLocationButton
              shopName={shopName}
              mapsUrl={shop.mapsUrl}
              latitude={shop.latitude}
              longitude={shop.longitude}
              address={mapsQuery || shop.address || shop.city}
              iconOnly
            />

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp de ${shopName}`}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--whatsapp)] text-white shadow-[0_6px_14px_var(--whatsapp-shadow)] transition hover:bg-[var(--whatsapp-hover)] sm:h-9 sm:w-9"
              >
                <WhatsAppIcon />
              </a>
            ) : null}

            <Link
              href={profileHref}
              aria-label={`Perfil de ${shopName}`}
              className="sr-only"
            >
              Perfil
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}

function ShopBadgePill({ badge }: { badge: ShopBadge }) {
  return (
    <span className="inline-flex items-center rounded-full bg-black/72 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-gold-light ring-1 ring-gold/35 backdrop-blur-sm sm:text-[10px]">
      {badge.label}
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5 fill-current sm:size-4">
      <path d="M12 2.2a9.7 9.7 0 0 0-8.4 14.6L2 22l5.4-1.4A9.7 9.7 0 1 0 12 2.2Zm0 17.6a7.9 7.9 0 0 1-4-.1l-.3-.1-3.2.8.9-3.1-.2-.3a7.9 7.9 0 1 1 6.8 2.8Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4l.4-.5c.1-.1.1-.2.2-.4 0-.1 0-.3 0-.4 0-.1-.5-1.3-.7-1.7-.2-.5-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4.5.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}
