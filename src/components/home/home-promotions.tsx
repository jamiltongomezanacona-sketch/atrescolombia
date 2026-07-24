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

  const [featured, ...rest] = tiles;

  return (
    <section className="home-section catalog-container" aria-labelledby="home-promotions-title">
      <HomeSectionHeader
        id="home-promotions-title"
        eyebrow="Marketplace"
        title="Promociones destacadas"
        href="/promociones"
        linkLabel="Ver todas"
      />

      <div className="grid gap-2.5 lg:grid-cols-[1.35fr_1fr] lg:gap-3">
        {featured ? (
          <Link
            href={featured.href}
            className="group relative min-h-[200px] overflow-hidden rounded-[var(--radius-card)] bg-black-main text-white ring-1 ring-white/10 sm:min-h-[240px] lg:min-h-[280px]"
          >
            <SafeProductImage
              src={featured.image}
              alt={featured.title}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover opacity-55 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-62"
            />
            <div className="premium-media-fade absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent" />
            <div className="relative flex h-full min-h-[200px] flex-col justify-end p-4 sm:min-h-[240px] sm:p-5 lg:min-h-[280px]">
              <p className="text-[11px] font-medium tracking-wide text-gold-light">Destacado</p>
              <p className="mt-1 text-xl font-medium leading-tight sm:text-2xl lg:text-3xl">{featured.title}</p>
              <p className="mt-2 max-w-md line-clamp-2 text-sm leading-6 text-white/80">{featured.subtitle}</p>
              <span className="mt-3 inline-flex w-fit items-center rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-black-main">
                {featured.cta}
              </span>
            </div>
          </Link>
        ) : null}

        <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
          {rest.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="group relative min-h-[112px] overflow-hidden rounded-[var(--radius-card)] bg-black-main text-white ring-1 ring-white/10 sm:min-h-[120px] lg:min-h-0 lg:flex-1"
            >
              <SafeProductImage
                src={tile.image}
                alt={tile.title}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 28vw"
                className="object-cover opacity-48 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-56"
              />
              <div className="premium-media-fade absolute inset-0" />
              <div className="relative flex h-full min-h-[112px] flex-col justify-end p-3 sm:min-h-[120px] sm:p-3.5">
                <p className="text-sm font-medium leading-tight sm:text-base">{tile.title}</p>
                <p className="mt-1 line-clamp-1 text-[11px] text-white/72 sm:text-xs">{tile.subtitle}</p>
                <span className="mt-1.5 text-[11px] font-medium text-gold-light underline-offset-2 group-hover:underline">
                  {tile.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
