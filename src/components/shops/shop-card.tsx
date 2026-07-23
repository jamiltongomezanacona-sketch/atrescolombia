import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import type { PublicShop } from "@/lib/public-store";
import { formatDistanceKm } from "@/lib/geo";

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
  const placeLabel = shop.neighborhood || shop.locality || shop.city || "Colombia";
  const distanceLabel = formatDistanceKm(shop.distanceKm);

  return (
    <li className="min-w-0">
      <Link
        href={`/tiendas/${shop.slug}`}
        aria-label={`Ver tienda ${shopName}`}
        className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-surface shadow-[0_8px_22px_rgba(18,18,18,0.06)] ring-1 ring-black/[0.06] transition-[transform,box-shadow,background-color] duration-200 ease-out md:hover:-translate-y-1 md:hover:shadow-[0_14px_34px_rgba(18,18,18,0.1)] md:hover:ring-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-surface-muted">
          <SafeProductImage
            src={shop.imageUrl}
            alt=""
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
            className="object-cover transition duration-200 ease-out md:group-hover:scale-[1.025]"
          />
        </div>

        <div className="flex min-h-[7.5rem] flex-col overflow-hidden px-2.5 pb-2.5 pt-2 sm:min-h-[7.75rem] sm:px-3 sm:pb-3">
          <h2 className="line-clamp-2 min-h-[2rem] text-[13px] font-medium leading-[1.2] tracking-normal text-ink sm:text-sm">
            {shopName}
          </h2>
          {shop.categoryLabel ? (
            <p className="mt-0.5 line-clamp-1 text-[10px] font-medium uppercase tracking-wide text-ink-muted sm:text-[11px]">
              {shop.categoryLabel}
            </p>
          ) : null}
          <p className="mt-1 line-clamp-1 text-[11px] font-normal leading-4 text-ink-muted sm:text-xs">
            {placeLabel}
            {distanceLabel ? ` · ${distanceLabel}` : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {shop.pickupEnabled ? (
              <span className="rounded-full bg-[#eef6ff] px-2 py-0.5 text-[10px] font-medium text-[#0b1f3a] ring-1 ring-[#d8e7f5]">
                Recogida
              </span>
            ) : null}
            {shop.localDeliveryEnabled ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 ring-1 ring-emerald-100">
                Entrega local
              </span>
            ) : null}
            {shop.verified ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                Verificada
              </span>
            ) : null}
          </div>
          <span className="mt-auto inline-flex h-11 min-h-11 items-center justify-center rounded-full bg-ink px-2.5 text-[11px] font-medium text-white transition duration-200 ease-out group-hover:bg-black group-focus-visible:bg-black group-active:scale-[0.98] sm:h-8 sm:min-h-8 sm:text-xs">
            Ver tienda
            <span aria-hidden="true" className="ml-1 transition-transform duration-200 ease-out md:group-hover:translate-x-0.5">
              -&gt;
            </span>
          </span>
        </div>
      </Link>
    </li>
  );
}
