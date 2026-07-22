import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { SafeProductImage } from "@/components/safe-product-image";
import { getPublicProducts, getPublicShops } from "@/lib/public-store";

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
      <section className="catalog-container products-catalog-container py-3 md:py-4">
        <div className="mb-3 md:mb-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Multitienda</p>
          <h1 className="mt-0.5 text-xl font-medium tracking-tight text-ink sm:text-2xl">Tiendas</h1>
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
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shops.map((shop) => {
              const shopName = shop.title || shop.name;
              const productCount = shop.productCount ?? 0;
              const preview = shopPreviews.get(shop.id);
              const thumbnails = preview?.thumbnails ?? [];
              const categories = preview?.categories ?? [];
              const statusBadge = preview?.hasPopular ? "Popular" : preview?.hasFeatured ? "Destacada" : null;

              return (
                <li key={shop.id} className="min-w-0">
                  <Link
                    href={`/tiendas/${shop.slug}`}
                    aria-label={`Ver tienda ${shopName}`}
                    className="atres-interactive group flex h-full flex-col overflow-hidden rounded-[20px] bg-surface shadow-[0_16px_44px_rgba(15,15,15,0.08)] ring-1 ring-black/[0.06] transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,15,15,0.12)] hover:ring-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0 active:scale-[0.99]"
                  >
                    <div className="relative aspect-[3/5] overflow-hidden rounded-t-[20px] bg-surface-muted">
                      <SafeProductImage
                        src={shop.coverUrl || shop.logoUrl || "/icono.png"}
                        alt=""
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover transition duration-500 ease-out group-hover:scale-[1.035]"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[48%] items-end bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4">
                        <div className="min-w-0">
                          <h2 className="line-clamp-2 text-lg font-medium leading-tight tracking-tight text-white drop-shadow-sm">
                            {shopName}
                          </h2>
                          <p className="mt-2 inline-flex items-center rounded-full bg-white/[0.14] px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/20 backdrop-blur-sm">
                            ✓ Tienda verificada
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-3.5 sm:p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-ink">{shop.city || "Colombia"}</p>
                        <p className="text-xs font-normal text-ink-muted">
                          {productCount} producto{productCount === 1 ? "" : "s"}
                        </p>
                        {categories.length > 0 ? (
                          <p className="line-clamp-1 text-xs font-normal text-ink-muted/85">
                            {categories.join(" • ")}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-1.5" aria-label="Insignias de tienda">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                          ✓ Verificada
                        </span>
                        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700 ring-1 ring-black/[0.04]">
                          Colombiana
                        </span>
                        {statusBadge ? (
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-700 ring-1 ring-orange-100">
                            {statusBadge}
                          </span>
                        ) : null}
                      </div>

                      {thumbnails.length >= 3 ? (
                        <div className="flex gap-2" aria-label="Productos destacados de la tienda">
                          {thumbnails.map((thumbnail, index) => (
                            <span
                              key={`${shop.id}-${thumbnail}-${index}`}
                              className="relative size-10 overflow-hidden rounded-xl bg-surface-muted ring-1 ring-black/[0.05] sm:size-11"
                            >
                              <SafeProductImage
                                src={thumbnail}
                                alt=""
                                sizes="56px"
                                className="object-cover transition duration-200 ease-out group-hover:scale-[1.025]"
                              />
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <span className="mt-auto inline-flex h-9 items-center justify-center rounded-full bg-ink px-4 text-sm font-medium text-white transition duration-200 ease-out group-hover:bg-black group-focus-visible:bg-black group-active:scale-[0.98]">
                        Ver tienda
                        <span
                          aria-hidden="true"
                          className="ml-1 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                        >
                          →
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
