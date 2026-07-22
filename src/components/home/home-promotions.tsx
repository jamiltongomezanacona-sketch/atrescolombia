import Link from "next/link";
import { HomeSectionHeader } from "@/components/home/section-header";
import { SafeProductImage } from "@/components/safe-product-image";
import {
  getHomeCategoryImage,
  HOME_CATEGORY_IMAGES,
  HOME_HERO_CONTENT,
} from "@/components/home/home-visuals";
import type { Product, Promo } from "@/lib/store-data";
import type { StoreCategory } from "@/lib/store-navigation";

type PromoTile = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  cta: string;
};

type HomePromotionsProps = {
  promos: Promo[];
  categories: StoreCategory[];
  promoProducts: Product[];
  newProducts: Product[];
};

function buildPromotionTiles({
  promos,
  categories,
  promoProducts,
  newProducts,
}: HomePromotionsProps): PromoTile[] {
  const tiles: PromoTile[] = [];
  const seen = new Set<string>();

  const push = (tile: PromoTile) => {
    if (tiles.length >= 4 || seen.has(tile.href)) return;
    seen.add(tile.href);
    tiles.push(tile);
  };

  for (const [index, promo] of promos.slice(0, 4).entries()) {
    push({
      key: `promo-${index}-${promo.href}`,
      title: promo.title,
      subtitle: promo.subtitle || "Descubre la seleccion en ATRES.",
      href: promo.href || "/productos",
      image: promo.image,
      cta: "Ver mas",
    });
  }

  const fallbacks: PromoTile[] = [
    {
      key: "route-ofertas",
      title: "Ofertas",
      subtitle: "Productos con precio especial en la vitrina.",
      href: "/ofertas",
      image: promoProducts[0]?.image ?? HOME_CATEGORY_IMAGES.ofertas,
      cta: "Ver ofertas",
    },
    {
      key: "route-novedades",
      title: "Novedades",
      subtitle: "Lo mas reciente agregado al catalogo.",
      href: "/novedades",
      image: newProducts[0]?.image ?? HOME_CATEGORY_IMAGES.novedades,
      cta: "Ver novedades",
    },
    ...categories.slice(0, 2).map((category) => ({
      key: `cat-${category.slug}`,
      title: category.shortName,
      subtitle: category.description || `Explora ${category.shortName} en ATRES.`,
      href: `/categoria/${category.slug}`,
      image: getHomeCategoryImage(category),
      cta: "Explorar",
    })),
    {
      key: "route-productos",
      title: "Todo el catalogo",
      subtitle: "Encuentra moda, hogar y mas en un solo lugar.",
      href: "/productos",
      image: HOME_HERO_CONTENT.fallbackImage,
      cta: "Explorar",
    },
  ];

  for (const tile of fallbacks) {
    push(tile);
    if (tiles.length >= 4) break;
  }

  return tiles;
}

export function HomePromotions(props: HomePromotionsProps) {
  const tiles = buildPromotionTiles(props);
  if (!tiles.length) return null;

  return (
    <section className="home-section catalog-container" aria-labelledby="home-promotions-title">
      <HomeSectionHeader
        id="home-promotions-title"
        eyebrow="Descubre mas"
        title="Promociones destacadas"
        href="/promociones"
        linkLabel="Ver todas"
      />

      <div className="home-scroll-row atres-scroll -mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 lg:gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            className="home-scroll-item group relative min-h-[148px] min-w-[78%] overflow-hidden rounded-[var(--radius-card)] bg-ink text-white shadow-soft ring-1 ring-black/[0.06] sm:min-h-[156px] sm:min-w-0 lg:min-h-[168px]"
          >
            <SafeProductImage
              src={tile.image}
              alt={tile.title}
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 48vw, 24vw"
              className="object-cover opacity-50 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-58"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/10" />
            <div className="relative flex h-full min-h-[148px] flex-col justify-end p-3.5 sm:p-4">
              <p className="text-base font-medium leading-tight sm:text-lg">{tile.title}</p>
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/78 sm:text-sm">{tile.subtitle}</p>
              <span className="mt-2.5 inline-flex w-fit items-center rounded-full bg-white/14 px-2.5 py-1 text-[11px] font-medium ring-1 ring-white/25">
                {tile.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
