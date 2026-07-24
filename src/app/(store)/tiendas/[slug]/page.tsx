import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeProductImage } from "@/components/safe-product-image";
import {
  ShopLocationButton,
  ShopLocationRow,
} from "@/components/shops/shop-location-row";
import { getPublicShopBySlug } from "@/lib/public-store";
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
  const shortDescription = shop.shortDescription.trim();
  const fullDescription = shop.description.trim();
  const locationItems = [
    { label: "Ciudad", value: shop.city },
    { label: "Departamento", value: shop.department },
    { label: "Barrio", value: shop.neighborhood || shop.locality },
  ].filter((item) => item.value?.trim());
  const mapsAddress = [shop.address, shop.neighborhood, shop.locality, shop.city, shop.department, shop.country]
    .filter(Boolean)
    .join(", ");
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

        <article className="theme-panel mt-4 overflow-hidden rounded-[20px] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lift">
          <div className="relative aspect-[16/9] bg-surface-muted sm:aspect-[21/9]">
            <SafeProductImage src={image} alt="" className="object-cover" sizes="(max-width: 920px) 100vw, 920px" />
            {shop.verified ? (
              <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold text-black-main ring-1 ring-gold-light/40 backdrop-blur-sm">
                Verificada
              </span>
            ) : null}
            {shop.logoUrl ? (
              <div className="absolute bottom-3 left-3 size-16 overflow-hidden rounded-2xl bg-black-main shadow-lg ring-1 ring-white/15 sm:size-20">
                <SafeProductImage src={shop.logoUrl} alt={`Logo ${shopName}`} className="object-cover" sizes="80px" />
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 p-3 sm:gap-3.5 sm:p-4">
            {shortDescription ? (
              <p className="text-sm leading-6 text-ink-muted">{shortDescription}</p>
            ) : null}
            {fullDescription && fullDescription !== shortDescription ? (
              <p className="text-sm leading-6 text-ink-muted">{fullDescription}</p>
            ) : null}

            <ShopLocationRow
              city={shop.city}
              locality={shop.locality}
              neighborhood={shop.neighborhood}
              mapsUrl={shop.mapsUrl}
              latitude={shop.latitude}
              longitude={shop.longitude}
              address={mapsAddress || shop.address}
              className="border-t border-white/10 pt-3 text-sm"
            />

            {locationItems.length > 0 ? (
              <dl className="theme-muted-panel grid gap-2 rounded-2xl px-3 py-2.5 sm:grid-cols-3">
                {locationItems.map((item) => (
                  <div key={item.label} className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      {item.label}
                    </dt>
                    <dd className="mt-1 truncate text-sm font-medium text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {shop.address ? (
              <div className="theme-muted-panel min-w-0 rounded-2xl px-3 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Direccion</p>
                <p className="mt-1 break-words text-sm font-medium text-ink">{shop.address}</p>
                {shop.addressReference ? (
                  <p className="mt-0.5 text-xs text-ink-muted">{shop.addressReference}</p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-1.5">
              {shop.pickupEnabled ? (
                <span className="rounded-full bg-gold/16 px-2.5 py-1 text-[11px] font-medium text-gold-light ring-1 ring-gold/30">
                  Recogida disponible
                </span>
              ) : null}
              {shop.localDeliveryEnabled ? (
                <span className="rounded-full bg-gold/12 px-2.5 py-1 text-[11px] font-medium text-gold-light ring-1 ring-gold/30">
                  Entrega local
                  {shop.deliveryRadiusKm != null ? ` · ~${shop.deliveryRadiusKm} km` : ""}
                </span>
              ) : null}
            </div>

            <div className={`grid gap-2 ${whatsappUrl ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              <Link
                href={`/productos?tienda=${encodeURIComponent(shop.slug)}`}
                  className="theme-primary-button inline-flex h-11 min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
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
                showDisabled
                className="!w-full px-4 text-sm"
              />
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="theme-secondary-button inline-flex h-11 min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
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
