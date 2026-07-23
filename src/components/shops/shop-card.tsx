import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import type { PublicShop } from "@/lib/public-store";
import { ShopLocationButton, ShopLocationRow } from "@/components/shops/shop-location-row";
import { buildMapsLocationUrl } from "@/lib/geo";

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
  const hasLocation = Boolean(
    buildMapsLocationUrl({
      mapsUrl: shop.mapsUrl,
      latitude: shop.latitude,
      longitude: shop.longitude,
      address: shop.address,
    }),
  );

  return (
    <li className="min-w-0">
      <article className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-surface shadow-[0_8px_22px_rgba(18,18,18,0.06)] ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,18,18,0.1)]">
        <Link
          href={profileHref}
          aria-label={`Ver perfil de ${shopName}`}
          className="relative block aspect-[4/5] overflow-hidden rounded-[18px] bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <SafeProductImage
            src={shop.imageUrl}
            alt=""
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
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
                href={profileHref}
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
          </div>

          <ShopLocationRow
            city={shop.city}
            locality={shop.locality}
            neighborhood={shop.neighborhood}
            distanceKm={shop.distanceKm}
            mapsUrl={shop.mapsUrl}
            latitude={shop.latitude}
            longitude={shop.longitude}
            address={shop.address}
            className="mt-0.5 border-t border-black/[0.05] pt-2"
          />

          <div className="mt-auto flex w-full gap-1.5 pt-1">
            <Link
              href={catalogHref}
              className={`${hasLocation ? "w-1/2" : "w-full"} inline-flex h-11 min-h-11 items-center justify-center rounded-full bg-ink px-2 text-[11px] font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98] sm:text-xs`}
            >
              <span className="truncate">Ver catalogo</span>
            </Link>
            <ShopLocationButton
              shopName={shopName}
              mapsUrl={shop.mapsUrl}
              latitude={shop.latitude}
              longitude={shop.longitude}
              address={shop.address}
            />
          </div>
        </div>
      </article>
    </li>
  );
}
