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
      className="theme-muted-panel mt-3 rounded-2xl p-3 sm:p-3.5"
      aria-label={`Tienda ${shopName}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Vendido por</p>
          <Link
            href={catalogHref}
            className="mt-0.5 block truncate text-sm font-semibold text-ink transition hover:text-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {shopName}
          </Link>
          <Link
            href={profileHref}
            className="mt-0.5 inline-block text-[11px] font-medium text-ink-muted underline-offset-2 transition hover:text-ink hover:underline"
          >
            Ver perfil e info
          </Link>
        </div>
        {shop.verified ? (
          <span className="shrink-0 rounded-full bg-gold/16 px-2 py-0.5 text-[10px] font-semibold text-gold-light ring-1 ring-gold/30">
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
        className="mt-2 border-t border-white/10 pt-2"
      />

      {shop.address ? (
        <p className="mt-1.5 line-clamp-2 break-words text-[11px] leading-4 text-ink-muted sm:text-xs">
          {shop.address}
          {shop.addressReference ? ` · ${shop.addressReference}` : ""}
        </p>
      ) : null}

      <div className="mt-2.5 flex gap-1.5">
        <Link
          href={catalogHref}
          className="theme-primary-button inline-flex h-10 min-h-10 min-w-0 flex-[1.2] items-center justify-center rounded-full px-2 text-[11px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:text-xs"
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
          className="!h-10 !min-h-10 !w-auto flex-1 px-2"
        />
      </div>
    </aside>
  );
}
