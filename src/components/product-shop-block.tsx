import Link from "next/link";
import { ShopLocationButton, ShopLocationRow } from "@/components/shops/shop-location-row";
import type { PublicShop } from "@/lib/public-store";

type ProductShopBlockProps = {
  shop: PublicShop;
};

export function ProductShopBlock({ shop }: ProductShopBlockProps) {
  const shopName = shop.title || shop.name;
  const profileHref = `/tiendas/${shop.slug}`;
  const catalogHref = `/productos?tienda=${encodeURIComponent(shop.slug)}`;
  const mapsAddress = [shop.address, shop.neighborhood, shop.locality, shop.city, shop.department, shop.country]
    .filter(Boolean)
    .join(", ");

  return (
    <aside
      className="mt-3 rounded-2xl border border-black/[0.06] bg-[#fafbfc] p-3 sm:p-3.5"
      aria-label={`Tienda ${shopName}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Vendido por</p>
          <Link
            href={profileHref}
            className="mt-0.5 block truncate text-sm font-semibold text-ink transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {shopName}
          </Link>
        </div>
        {shop.verified ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
            Verificada
          </span>
        ) : null}
      </div>

      <ShopLocationRow
        city={shop.city}
        locality={shop.locality}
        neighborhood={shop.neighborhood}
        mapsUrl={shop.mapsUrl}
        latitude={shop.latitude}
        longitude={shop.longitude}
        address={mapsAddress || shop.address}
        className="mt-2 border-t border-black/[0.05] pt-2"
      />

      {shop.address ? (
        <p className="mt-1.5 line-clamp-2 break-words text-[11px] leading-4 text-ink-muted sm:text-xs">
          {shop.address}
          {shop.addressReference ? ` · ${shop.addressReference}` : ""}
        </p>
      ) : null}

      <div className="mt-2.5 flex gap-1.5">
        <Link
          href={profileHref}
          className="inline-flex h-10 min-h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-ink px-2 text-[11px] font-semibold text-white transition duration-200 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-xs"
        >
          <span className="truncate">Ver tienda</span>
        </Link>
        <Link
          href={catalogHref}
          className="inline-flex h-10 min-h-10 min-w-0 flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-2 text-[11px] font-semibold text-ink transition duration-200 hover:border-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-xs"
        >
          <span className="truncate">Ver catalogo</span>
        </Link>
        <ShopLocationButton
          shopName={shopName}
          mapsUrl={shop.mapsUrl}
          latitude={shop.latitude}
          longitude={shop.longitude}
          address={mapsAddress || shop.address}
          label="Ver ubicacion"
          className="!h-10 !min-h-10 !w-auto flex-[1.15] px-2"
        />
      </div>
    </aside>
  );
}
