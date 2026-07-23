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
      <section className="catalog-container products-catalog-container !max-w-[1320px] !px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-2 sm:!px-4 md:pb-6 md:pt-3 lg:pb-7">
        <div className="mb-2.5 md:mb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">Multitienda</p>
          <h1 className="mt-0.5 text-xl font-medium tracking-normal text-ink sm:text-2xl">Tiendas</h1>
          <p className="mt-1 max-w-xl text-xs font-normal text-ink-muted sm:text-sm">
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
