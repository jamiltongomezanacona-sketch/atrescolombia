import { EmptyState } from "@/components/ui/empty-state";
import { ShopsExplorer } from "@/components/shops/shops-explorer";
import type { ShopCardModel } from "@/components/shops/shop-card";
import { getPublicProducts, getPublicShops } from "@/lib/public-store";

export const metadata = {
  title: "Tiendas",
  description: "Explora las tiendas de moda ATRES y sus catálogos.",
};

export default async function ShopsPage() {
  const shops = await getPublicShops();
  const shopPreviews =
    shops.length > 0 ? buildShopPreviews(await getPublicProducts()) : new Map<string, ShopPreview>();

  const cards: ShopCardModel[] = shops.map((shop) => {
    const preview = shopPreviews.get(shop.id);
    return {
      ...shop,
      imageUrl: shop.coverUrl || shop.logoUrl || preview?.thumbnails[0] || "/assets/atres-curated/placeholder.webp",
      categoryLabel: preview?.categories[0],
    };
  });

  return (
    <main>
      <section className="catalog-container products-catalog-container pb-3 pt-1 md:pb-4 md:pt-1.5 lg:pb-5 lg:pt-2">
        <div className="mb-2 flex flex-col gap-1 border-b border-black/[0.06] pb-2 sm:mb-2.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3 lg:mb-3 lg:pb-2.5">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Multitienda</p>
            <h1 className="mt-0.5 text-base font-medium tracking-tight text-ink sm:text-lg lg:text-xl">Tiendas</h1>
          </div>
          <p className="max-w-xl text-xs font-normal text-ink-muted sm:text-right sm:text-sm">
            Elige una tienda para ver su perfil o catalogo. La ubicacion del visitante es opcional.
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
          <ShopsExplorer shops={cards} />
        )}
      </section>
    </main>
  );
}

type ShopPreview = {
  categories: string[];
  thumbnails: string[];
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

    previews.set(product.shopId, preview);
  }

  return previews;
}
