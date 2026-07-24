import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import type { PublicShop } from "@/lib/public-store";
import { ShopLocationButton, ShopLocationRow } from "@/components/shops/shop-location-row";

export type ShopCardModel = PublicShop & {
  imageUrl: string;
  categoryLabel?: string;
  distanceKm?: number | null;
};

type ShopCardProps = {
  shop: ShopCardModel;
};

export function ShopCard({ shop }: ShopCardProps) {
  const shopName = shop.title || shop.name;
  const description = shop.shortDescription?.trim() || shop.categoryLabel?.trim() || "";
  const catalogHref = `/productos?tienda=${encodeURIComponent(shop.slug)}`;
  const profileHref = `/tiendas/${shop.slug}`;
  const mapsQuery = [shop.address, shop.neighborhood, shop.locality, shop.city, shop.department, shop.country]
    .filter(Boolean)
    .join(", ");
  const streetAddress = shop.address?.trim() || "";

  return (
    <li className="min-w-0">
      <article className="store-card group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] motion-safe:hover:-translate-y-0.5">
        <Link
          href={catalogHref}
          aria-label={`Ver catalogo de ${shopName}`}
          className="relative block aspect-[3/4] overflow-hidden bg-surface-muted/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <SafeProductImage
            src={shop.imageUrl}
            alt=""
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, (max-width: 1536px) 17vw, (max-width: 1800px) 16vw, 14vw"
            className="object-cover transition duration-200 ease-out group-hover:scale-[1.02]"
          />
          {shop.verified ? (
            <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold leading-4 text-emerald-800 ring-1 ring-emerald-100/80 backdrop-blur-sm sm:text-[11px]">
              Verificada
            </span>
          ) : null}
        </Link>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 pb-2.5 pt-2.5 sm:px-3 sm:pb-3">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-[13px] font-medium leading-[1.25] tracking-normal text-ink sm:text-sm">
              <Link
                href={catalogHref}
                className="transition-colors duration-200 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {shopName}
              </Link>
            </h2>
            {description ? (
              <p className="mt-1 line-clamp-2 text-[11px] font-normal leading-4 text-ink-muted sm:text-xs">
                {description}
              </p>
            ) : null}
            <Link
              href={profileHref}
              className="mt-1 inline-block text-[10px] font-medium text-ink-muted underline-offset-2 transition hover:text-ink hover:underline sm:text-[11px]"
            >
              Perfil e info
            </Link>
          </div>

          <div className="mt-0.5 min-w-0 border-t border-black/[0.05] pt-2">
            <ShopLocationRow
              city={shop.city}
              locality={shop.locality}
              neighborhood={shop.neighborhood}
              distanceKm={shop.distanceKm}
              mapsUrl={shop.mapsUrl}
              latitude={shop.latitude}
              longitude={shop.longitude}
              address={mapsQuery || shop.address}
            />
            {streetAddress ? (
              <p className="mt-1 line-clamp-2 break-words pl-6 text-[10px] leading-4 text-ink-muted sm:text-[11px]">
                {streetAddress}
                {shop.addressReference ? ` · ${shop.addressReference}` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-auto grid w-full gap-1.5 pt-1">
            <Link
              href={catalogHref}
              className="inline-flex h-10 min-h-10 w-full items-center justify-center rounded-full bg-ink px-3 text-[11px] font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98] sm:h-11 sm:min-h-11 sm:text-xs"
            >
              Ver catalogo
            </Link>
            <ShopLocationButton
              shopName={shopName}
              mapsUrl={shop.mapsUrl}
              latitude={shop.latitude}
              longitude={shop.longitude}
              address={mapsQuery || shop.address || shop.city}
              fullWidth
            />
          </div>
        </div>
      </article>
    </li>
  );
}
