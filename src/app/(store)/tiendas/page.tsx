import { EmptyState } from "@/components/ui/empty-state";
import { ShopsExplorer } from "@/components/shops/shops-explorer";
import type { ShopCardModel } from "@/components/shops/shop-card";
import { getPublicProducts, getPublicShops } from "@/lib/public-store";
import { buildShopsPageStats } from "@/lib/shop-card-presentation";

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

  const stats = buildShopsPageStats(cards);

  return (
    <main>
      <section className="catalog-container products-catalog-container pb-3 pt-1 md:pb-4 md:pt-1.5 lg:pb-5 lg:pt-2">
        <div className="mb-2 border-b border-white/10 pb-2 sm:mb-2.5">
          <div className="min-w-0">
            <h1 className="text-sm font-medium tracking-tight text-ink sm:text-base lg:text-lg">
              Tiendas
              <span className="ml-1.5 text-xs font-normal text-ink-muted sm:text-sm">· {stats.total}</span>
            </h1>
            <p className="mt-0.5 text-[11px] font-normal text-ink-muted sm:text-xs">
              Marketplace de moda colombiana. La ubicacion es opcional.
            </p>
          </div>

          {stats.total > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
              <StatChip label={`${stats.verified} verificadas`} hint="Tiendas" />
              <StatChip
                label={stats.products > 0 ? `${stats.products.toLocaleString("es-CO")} productos` : "Catalogos activos"}
                hint="Stock"
              />
              <StatChip label={stats.national ? "Envios nacionales" : "Cobertura local"} hint="Logistica" />
              <StatChip label={`${stats.total} en vitrina`} hint="Marketplace" />
            </div>
          ) : null}
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

function StatChip({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-white/[0.04] px-2.5 py-1.5 ring-1 ring-white/10">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">{hint}</p>
      <p className="mt-0.5 text-[11px] font-medium text-ink sm:text-xs">{label}</p>
    </div>
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
