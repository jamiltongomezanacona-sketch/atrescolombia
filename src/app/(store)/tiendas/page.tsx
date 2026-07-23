import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SafeProductImage } from "@/components/safe-product-image";
import { getPublicProducts, getPublicShops, type PublicShop } from "@/lib/public-store";

export const metadata = {
  title: "Tiendas",
  description: "Explora las tiendas de moda ATRES y sus catálogos.",
};

export default async function ShopsPage() {
  const shops = await getPublicShops();
  const shopPreviews =
    shops.length > 0 ? buildShopPreviews(await getPublicProducts()) : new Map<string, ShopPreview>();

  return (
    <main>
      <section className="catalog-container products-catalog-container !max-w-[1320px] !px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-2 sm:!px-4 md:pb-6 md:pt-3 lg:pb-7">
        <div className="mb-2.5 md:mb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Multitienda</p>
          <h1 className="mt-0.5 text-xl font-medium tracking-normal text-ink sm:text-2xl">Tiendas</h1>
          <p className="mt-1 max-w-xl text-xs font-normal text-ink-muted sm:text-sm">
            Elige una tienda para ver solo sus productos.
          </p>
        </div>

        {shops.length === 0 ? (
          <EmptyState
            title="Sin tiendas activas"
            description="Pronto veras aqui las tiendas disponibles en ATRES."
            actionHref="/productos"
            actionLabel="Ver catalogo"
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {shops.map((shop) => {
              const shopName = shop.title || shop.name;
              const preview = shopPreviews.get(shop.id);
              const shopImage =
                shop.coverUrl || shop.logoUrl || preview?.thumbnails[0] || "/assets/atres-curated/placeholder.webp";
              const isVerified = hasVerifiedStatus(shop);

              return (
                <li key={shop.id} className="min-w-0">
                  <Link
                    href={`/tiendas/${shop.slug}`}
                    aria-label={`Ver tienda ${shopName}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[18px] bg-surface shadow-[0_8px_22px_rgba(18,18,18,0.06)] ring-1 ring-black/[0.06] transition-[transform,box-shadow,background-color] duration-200 ease-out md:hover:-translate-y-1 md:hover:shadow-[0_14px_34px_rgba(18,18,18,0.1)] md:hover:ring-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[0.98]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-surface-muted">
                      <SafeProductImage
                        src={shopImage}
                        alt=""
                        sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1535px) 25vw, 20vw"
                        className="object-cover transition duration-200 ease-out md:group-hover:scale-[1.025]"
                      />
                    </div>

                    <div className="flex h-[7.25rem] flex-col overflow-hidden px-2.5 pb-2.5 pt-2 sm:h-[7.5rem] sm:px-3 sm:pb-3">
                      <h2 className="line-clamp-2 min-h-[2rem] text-[13px] font-medium leading-[1.2] tracking-normal text-ink sm:text-sm">
                        {shopName}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-[11px] font-normal leading-4 text-ink-muted sm:text-xs">
                        {shop.city || "Colombia"}
                      </p>
                      {isVerified ? (
                        <span className="mt-1.5 w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium leading-4 text-emerald-700 ring-1 ring-emerald-100 sm:text-[11px]">
                          Verificada
                        </span>
                      ) : null}
                      <span className="mt-auto inline-flex h-7 items-center justify-center rounded-full bg-ink px-2.5 text-[11px] font-medium text-white transition duration-200 ease-out group-hover:bg-black group-focus-visible:bg-black group-active:scale-[0.98] sm:h-8 sm:text-xs">
                        Ver catalogo
                        <span
                          aria-hidden="true"
                          className="ml-1 transition-transform duration-200 ease-out md:group-hover:translate-x-0.5"
                        >
                          -&gt;
                        </span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

type ShopPreview = {
  categories: string[];
  thumbnails: string[];
  hasFeatured: boolean;
  hasPopular: boolean;
};

function buildShopPreviews(products: Awaited<ReturnType<typeof getPublicProducts>>) {
  const previews = new Map<string, ShopPreview>();

  for (const product of products) {
    if (!product.shopId) continue;

    const preview =
      previews.get(product.shopId) ??
      {
        categories: [],
        thumbnails: [],
        hasFeatured: false,
        hasPopular: false,
      };

    const category = product.categoryName.replace(/^Moda\s+/i, "").trim();
    if (category && preview.categories.length < 3 && !preview.categories.includes(category)) {
      preview.categories.push(category);
    }

    const images = product.images.length > 0 ? product.images : [product.image];
    for (const image of images) {
      if (preview.thumbnails.length >= 4) break;
      if (image && !preview.thumbnails.includes(image)) {
        preview.thumbnails.push(image);
      }
    }

    preview.hasFeatured = preview.hasFeatured || Boolean(product.isPromo || product.isNew);
    preview.hasPopular = preview.hasPopular || Boolean(product.isTrending);
    previews.set(product.shopId, preview);
  }

  return previews;
}

function hasVerifiedStatus(shop: PublicShop) {
  return (shop as PublicShop & { verified?: unknown }).verified === true;
}
