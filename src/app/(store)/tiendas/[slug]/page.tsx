import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeProductImage } from "@/components/safe-product-image";
import {
  ShopLocationButton,
  ShopLocationRow,
} from "@/components/shops/shop-location-row";
import { getPublicShopBySlug } from "@/lib/public-store";
import { buildMapsLocationUrl } from "@/lib/geo";
import { buildWhatsAppUrl, resolveStoreWhatsapp } from "@/lib/whatsapp";

type ShopProfilePageProps = {
  params?: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ShopProfilePageProps) {
  const { slug } = (await params) ?? { slug: "" };
  const shop = slug ? await getPublicShopBySlug(slug) : null;
  if (!shop) return { title: "Tienda" };
  return {
    title: shop.title || shop.name,
    description: shop.shortDescription || `Tienda ${shop.name} en ATRES Colombia.`,
  };
}

export default async function ShopProfilePage({ params }: ShopProfilePageProps) {
  const { slug } = (await params) ?? { slug: "" };
  if (!slug) notFound();

  const shop = await getPublicShopBySlug(slug);
  if (!shop) notFound();

  const shopName = shop.title || shop.name;
  const image = shop.coverUrl || shop.logoUrl || "/assets/atres-curated/placeholder.webp";
  const mapsAddress = [shop.address, shop.neighborhood, shop.locality, shop.city, shop.department, shop.country]
    .filter(Boolean)
    .join(", ");
  const hasMaps = Boolean(
    buildMapsLocationUrl({
      latitude: shop.latitude,
      longitude: shop.longitude,
      address: mapsAddress || shop.address,
      mapsUrl: shop.mapsUrl,
    }),
  );
  const whatsappUrl = shop.whatsapp
    ? buildWhatsAppUrl(
        resolveStoreWhatsapp(shop.whatsapp),
        `Hola, vi la tienda ${shopName} en ATRES y quiero mas informacion.`,
      )
    : null;

  return (
    <main>
      <section className="catalog-container products-catalog-container !max-w-[920px] !px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-2 sm:!px-4 md:pb-8 md:pt-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
          <Link href="/tiendas" className="hover:underline">
            Tiendas
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-medium tracking-normal text-ink sm:text-3xl">{shopName}</h1>
        <ShopLocationRow
          city={shop.city}
          locality={shop.locality}
          neighborhood={shop.neighborhood}
          mapsUrl={shop.mapsUrl}
          latitude={shop.latitude}
          longitude={shop.longitude}
          address={mapsAddress || shop.address}
          className="mt-2 max-w-xl text-sm sm:text-sm"
        />

        <article className="mt-4 overflow-hidden rounded-[20px] bg-surface shadow-[0_8px_22px_rgba(18,18,18,0.06)] ring-1 ring-black/[0.06] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,18,18,0.1)]">
          <div className="relative aspect-[16/9] bg-surface-muted sm:aspect-[21/9]">
            <SafeProductImage src={image} alt="" className="object-cover" sizes="(max-width: 920px) 100vw, 920px" />
            {shop.verified ? (
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100/80 backdrop-blur-sm">
                Verificada
              </span>
            ) : null}
          </div>

          <div className="grid gap-3 p-3 sm:gap-3.5 sm:p-4">
            {shop.shortDescription ? (
              <p className="text-sm leading-6 text-ink-muted">{shop.shortDescription}</p>
            ) : null}

            <ShopLocationRow
              city={shop.city}
              locality={shop.locality}
              neighborhood={shop.neighborhood}
              mapsUrl={shop.mapsUrl}
              latitude={shop.latitude}
              longitude={shop.longitude}
              address={mapsAddress || shop.address}
              className="border-t border-black/[0.05] pt-3 text-sm"
            />

            {shop.address ? (
              <div className="min-w-0 rounded-2xl bg-[#f7f8f9] px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Direccion</p>
                <p className="mt-1 break-words text-sm font-medium text-ink">{shop.address}</p>
                {shop.addressReference ? (
                  <p className="mt-0.5 text-xs text-ink-muted">{shop.addressReference}</p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-1.5">
              {shop.pickupEnabled ? (
                <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[11px] font-medium text-[#0b1f3a] ring-1 ring-[#d8e7f5]">
                  Recogida disponible
                </span>
              ) : null}
              {shop.localDeliveryEnabled ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-100">
                  Entrega local
                  {shop.deliveryRadiusKm != null ? ` · ~${shop.deliveryRadiusKm} km` : ""}
                </span>
              ) : null}
            </div>

            <div className={`grid gap-2 ${whatsappUrl ? "sm:grid-cols-3" : hasMaps ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
              <Link
                href={`/productos?tienda=${encodeURIComponent(shop.slug)}`}
                className="inline-flex h-11 min-h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-white transition-[background-color,transform] duration-200 ease-out hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
              >
                Ver catalogo
              </Link>
              <ShopLocationButton
                shopName={shopName}
                mapsUrl={shop.mapsUrl}
                latitude={shop.latitude}
                longitude={shop.longitude}
                address={mapsAddress || shop.address}
                fullWidth
                className="!w-full px-4 text-sm"
              />
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 min-h-11 items-center justify-center rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white transition-[filter,transform] duration-200 ease-out hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
