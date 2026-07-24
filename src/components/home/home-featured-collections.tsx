import Link from "next/link";
import { HomeSectionHeader } from "@/components/home/section-header";
import { SafeProductImage } from "@/components/safe-product-image";
import {
  getHomeCategoryImage,
  HOME_CATEGORY_IMAGES,
} from "@/components/home/home-visuals";
import type { Product } from "@/lib/store-data";
import type { StoreCategory } from "@/lib/store-navigation";

type CollectionTile = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  image: string;
};

type HomeFeaturedCollectionsProps = {
  categories: StoreCategory[];
  collectionProducts: Product[];
  promoProducts: Product[];
  newProducts: Product[];
};

function buildCollectionTiles({
  categories,
  collectionProducts,
  promoProducts,
  newProducts,
}: HomeFeaturedCollectionsProps): CollectionTile[] {
  const tiles: CollectionTile[] = [];
  const seen = new Set<string>();

  const push = (tile: CollectionTile) => {
    if (seen.has(tile.href)) return;
    seen.add(tile.href);
    tiles.push(tile);
  };

  for (const category of categories) {
    push({
      key: `dept-${category.slug}`,
      title: category.shortName,
      subtitle: "Departamento",
      href: `/categoria/${category.slug}`,
      image: getHomeCategoryImage(category),
    });
  }

  push({
    key: "route-novedades",
    title: "Novedades",
    subtitle: "Recien llegados",
    href: "/novedades",
    image: newProducts[0]?.image ?? HOME_CATEGORY_IMAGES.novedades,
  });

  push({
    key: "route-ofertas",
    title: "Ofertas",
    subtitle: "Precio especial",
    href: "/ofertas",
    image: promoProducts[0]?.image ?? HOME_CATEGORY_IMAGES.ofertas,
  });

  for (const product of collectionProducts) {
    push({
      key: `collection-${product.collection}`,
      title: product.collection,
      subtitle: product.categoryName,
      href: `/productos?coleccion=${encodeURIComponent(product.collection)}`,
      image: product.image,
    });
  }

  return tiles.slice(0, 6);
}

export function HomeFeaturedCollections(props: HomeFeaturedCollectionsProps) {
  const tiles = buildCollectionTiles(props);
  if (!tiles.length) return null;

  return (
    <section className="home-section catalog-container" aria-labelledby="home-collections-title">
      <HomeSectionHeader
        id="home-collections-title"
        eyebrow="Descubre"
        title="Colecciones para explorar"
        href="/categorias"
        linkLabel="Ver todas"
      />

      <div className="home-scroll-row atres-scroll -mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6 lg:gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            href={tile.href}
            className="home-scroll-item group relative aspect-[3/4] min-w-[38%] overflow-hidden rounded-[var(--radius-card)] bg-black-main text-white ring-1 ring-white/10 sm:min-w-0"
          >
            <SafeProductImage
              src={tile.image}
              alt={tile.title}
              sizes="(max-width: 640px) 38vw, (max-width: 1024px) 30vw, 16vw"
              className="object-cover opacity-70 transition duration-500 group-hover:scale-[1.05] group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
              <p className="line-clamp-2 text-sm font-semibold leading-tight sm:text-[0.95rem]">{tile.title}</p>
              {tile.subtitle ? (
                <p className="mt-0.5 line-clamp-1 text-[10px] uppercase tracking-wide text-white/65 sm:text-[11px]">
                  {tile.subtitle}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
