import Link from "next/link";
import { notFound } from "next/navigation";
import { SafeProductImage } from "@/components/safe-product-image";
import { getPublicShopBySlug } from "@/lib/public-store";
import { buildMapsDirectionsUrl } from "@/lib/geo";
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
  const sector = [shop.neighborhood, shop.locality, shop.city].filter(Boolean).join(" · ") || "Colombia";
  const mapsUrl = buildMapsDirectionsUrl({
    latitude: shop.latitude,
    longitude: shop.longitude,
    address: [shop.address, shop.neighborhood, shop.city, shop.department, shop.country]
      .filter(Boolean)
      .join(", "),
    mapsUrl: shop.mapsUrl,
  });
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
        <p className="mt-1 text-sm text-ink-muted">{sector}</p>

        <div className="mt-4 overflow-hidden rounded-[20px] bg-surface ring-1 ring-black/[0.06]">
          <div className="relative aspect-[16/9] bg-surface-muted sm:aspect-[21/9]">
            <SafeProductImage src={image} alt="" className="object-cover" sizes="(max-width: 920px) 100vw, 920px" />
          </div>
          <div className="grid gap-3 p-3 sm:p-4">
            {shop.shortDescription ? (
              <p className="text-sm leading-6 text-ink-muted">{shop.shortDescription}</p>
            ) : null}

            {shop.address ? (
              <div className="min-w-0">
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
              {shop.verified ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                  Verificada
                </span>
              ) : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Link
                href={`/productos?tienda=${encodeURIComponent(shop.slug)}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-white"
              >
                Ver catalogo
              </Link>
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-black/10"
                >
                  Como llegar
                </a>
              ) : null}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25D366] px-4 text-sm font-semibold text-white"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
