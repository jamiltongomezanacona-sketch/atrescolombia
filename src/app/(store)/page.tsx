import Link from "next/link";
import { ProductRail } from "@/components/product-rail";
import { SafeProductImage } from "@/components/safe-product-image";
import { StoreBenefits } from "@/components/store-benefits";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "@/components/ui/product-price";
import {
  getPublicCategoriesForDisplay,
  getPublicNewProducts,
  getPublicProducts,
  getPublicPromoProducts,
  getPublicPromos,
  getPublicTrendingProducts,
} from "@/lib/public-store";
import { getDiscountPercent, type Product, type Promo } from "@/lib/store-data";
import type { StoreCategory } from "@/lib/store-navigation";

export const metadata = {
  title: {
    absolute: "ATRES | Moda colombiana directa",
  },
  description:
    "Compra moda colombiana, novedades, ofertas y colecciones ATRES con una experiencia rapida tipo marketplace.",
};

const HOME_HERO_CONTENT = {
  eyebrow: "ATRES Colombia",
  title: "Descubre lo mejor de Colombia",
  subtitle: "Moda, productos y emprendimientos colombianos en un solo lugar.",
  primaryLabel: "Explorar productos",
  primaryHref: "/productos",
  secondaryLabel: "Ver novedades",
  secondaryHref: "/novedades",
  fallbackImage: "/assets/atres-curated/banners/banner-campana_atres-001.webp",
};

const HOME_TRUST_ITEMS = [
  { label: "Productos colombianos", icon: "flag" as const },
  { label: "Atencion por WhatsApp", icon: "chat" as const },
  { label: "Compra directa", icon: "direct" as const },
  { label: "Envios segun cada tienda", icon: "store" as const },
];

const HOME_CATEGORY_IMAGES = {
  hombre: "/assets/atres-curated/banners/banner-campana_atres-003.webp",
  mujer: "/assets/atres-curated/banners/banner-campana_atres-004.webp",
  ninos: "/assets/atres-curated/products/producto-moda_infantil-001.webp",
  hogar: "/assets/atres-curated/banners/banner-campana_revision_marca-010.webp",
  default: "/assets/atres-curated/banners/banner-campana_atres-002.webp",
};

export default async function Home() {
  const [products, promos, categories, promoProducts, newProducts, trendingProducts] =
    await Promise.all([
      getPublicProducts(),
      getPublicPromos(),
      getPublicCategoriesForDisplay(),
      getPublicPromoProducts(),
      getPublicNewProducts(),
      getPublicTrendingProducts(),
    ]);

  const heroProduct = trendingProducts[0] ?? promoProducts[0] ?? products[0];
  const heroPromo = promos[0];
  const featuredProducts = trendingProducts.length ? trendingProducts : products;
  const recommended = products.filter((product) => product.stock > 0).slice(0, 12);
  const editorialProducts = uniqueProducts([
    ...trendingProducts,
    ...promoProducts,
    ...newProducts,
    ...products,
  ]).slice(0, 5);
  const collections = Array.from(
    new Map(
      products
        .filter((product) => isSpecificCollection(product.collection))
        .map((product) => [product.collection, product]),
    ).values(),
  ).slice(0, 4);

  return (
    <main>
      <HomeTrustStrip />
      <HeroSection product={heroProduct} promo={heroPromo} />
      <CategoryScroller categories={categories} />
      <ProductRail
        title="Destacados ATRES"
        subtitle="Seleccion actual para explorar primero."
        href="/productos?orden=tendencias"
        products={featuredProducts}
        priorityCount={4}
        maxItems={12}
      />
      <FlashSection products={promoProducts} />
      <ProductRail
        title="Novedades"
        subtitle="Productos recientes en la vitrina."
        href="/novedades"
        products={newProducts.length ? newProducts : products}
        maxItems={12}
      />
      <CollectionGrid products={collections} />
      <EditorialGallery products={editorialProducts} />
      <PromoGrid promos={promos} fallbackProducts={promoProducts} />
      <ProductRail
        title="Recomendados para ti"
        subtitle="Mas opciones para seguir descubriendo."
        href="/productos"
        products={recommended}
        maxItems={12}
      />
      <StoreBenefits />
    </main>
  );
}

function uniqueProducts(items: Product[]) {
  return Array.from(new Map(items.map((product) => [product.slug, product])).values());
}

function isSpecificCollection(collection: string) {
  return Boolean(collection.trim()) && collection.trim().toLowerCase() !== "atres";
}

function HeroSection({
  product,
  promo,
}: {
  product?: Product;
  promo?: Promo;
}) {
  const image = promo?.image ?? product?.image ?? HOME_HERO_CONTENT.fallbackImage;
  const title = promo?.title?.trim() || HOME_HERO_CONTENT.title;
  const subtitle = promo?.subtitle?.trim() || HOME_HERO_CONTENT.subtitle;

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white" aria-labelledby="home-hero-title">
      <div className="absolute inset-0">
        <SafeProductImage
          src={image}
          alt={title}
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-75 sm:object-[center_26%] lg:object-[72%_30%] lg:opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,10,10,0.88)_0%,rgba(10,10,10,0.52)_44%,rgba(10,10,10,0.12)_100%)]" />
      </div>

      <div className="catalog-container relative flex min-h-[310px] max-h-[460px] flex-col justify-end pb-5 pt-10 sm:min-h-[360px] sm:pb-7 lg:min-h-[410px] lg:pb-8">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.18em] text-white/80">
            {HOME_HERO_CONTENT.eyebrow.toUpperCase()}
          </p>
          <h1
            id="home-hero-title"
            className="mt-2 text-3xl font-medium leading-[0.98] tracking-tight !text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-2.5 max-w-md text-sm font-normal leading-6 text-white/85 sm:mt-3 sm:text-base sm:leading-7">
            {subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5 sm:gap-3">
            <Link
              href={HOME_HERO_CONTENT.primaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {HOME_HERO_CONTENT.primaryLabel}
            </Link>
            <Link
              href={HOME_HERO_CONTENT.secondaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white/10 px-5 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {HOME_HERO_CONTENT.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryScroller({ categories }: { categories: StoreCategory[] }) {
  if (!categories.length) return null;

  const items = [
    {
      label: "Todo",
      href: "/productos",
      image: HOME_HERO_CONTENT.fallbackImage,
    },
    ...categories.map((category) => ({
      label: category.shortName,
      href: `/categoria/${category.slug}`,
      image: getHomeCategoryImage(category),
    })),
  ];

  return (
    <section className="catalog-container py-3 md:py-4" aria-labelledby="home-categories-title">
      <div className="mb-2.5 flex items-end justify-between gap-3 md:mb-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-brand">Categorias</p>
          <h2 id="home-categories-title" className="mt-0.5 text-xl font-medium tracking-tight text-ink md:text-2xl">
            Explora por estilo
          </h2>
        </div>
        <Link
          href="/categorias"
          className="shrink-0 text-sm font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <nav className="atres-scroll -mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0 xl:grid-cols-6" aria-label="Categorias destacadas">
        {items.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="atres-interactive group grid w-[6.6rem] shrink-0 gap-2 rounded-[var(--radius-card)] bg-surface p-2 text-center ring-1 ring-black/[0.05] transition hover:shadow-soft lg:w-auto"
          >
            <span className="relative mx-auto block size-[4.65rem] overflow-hidden rounded-full bg-surface-muted ring-1 ring-black/[0.06] sm:size-20">
              <SafeProductImage
                src={category.image}
                alt={category.label}
                sizes="(max-width: 1024px) 96px, 160px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </span>
            <span className="min-h-8 text-[11px] font-medium leading-4 text-ink sm:text-xs">
              {category.label}
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
}

function getHomeCategoryImage(category: StoreCategory) {
  const image = category.image?.trim();
  if (image && !image.includes("images.unsplash.com")) return image;

  const key = `${category.slug} ${category.name} ${category.shortName}`.toLowerCase();
  if (key.includes("hombre")) return HOME_CATEGORY_IMAGES.hombre;
  if (key.includes("mujer")) return HOME_CATEGORY_IMAGES.mujer;
  if (key.includes("nino") || key.includes("nina") || key.includes("infantil") || key.includes("bebe")) {
    return HOME_CATEGORY_IMAGES.ninos;
  }
  if (key.includes("hogar") || key.includes("textil")) return HOME_CATEGORY_IMAGES.hogar;
  return HOME_CATEGORY_IMAGES.default;
}

function HomeTrustStrip() {
  return (
    <section className="border-b border-black/[0.06] bg-surface" aria-label="Confianza ATRES">
      <ul className="atres-scroll catalog-container flex gap-2 overflow-x-auto py-2 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:py-2.5">
        {HOME_TRUST_ITEMS.map((item) => (
          <li
            key={item.label}
            className="flex min-h-9 min-w-[11.5rem] shrink-0 items-center justify-center gap-2 rounded-[var(--radius-card)] bg-surface-muted/60 px-3 text-ink sm:min-h-10 sm:min-w-0 sm:bg-transparent sm:px-2"
          >
            <TrustIcon type={item.icon} />
            <span className="whitespace-nowrap text-[11px] font-medium leading-4 text-ink sm:text-xs">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrustIcon({ type }: { type: "flag" | "direct" | "chat" | "store" }) {
  const className = "size-3.5 shrink-0 text-ink-muted";

  if (type === "flag") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 4v16" />
        <path d="M5 5h10l-1.5 3.5L15 12H5" />
      </svg>
    );
  }

  if (type === "direct") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h14" />
        <path d="m13 6 5 6-5 6" />
      </svg>
    );
  }

  if (type === "chat") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 6h14v9H9l-4 3V6Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 9h16l-1.2 11H5.2L4 9Z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

function PromoGrid({
  promos,
  fallbackProducts,
}: {
  promos: Promo[];
  fallbackProducts: Product[];
}) {
  const tiles =
    promos.length > 0
      ? promos.slice(0, 3).map((promo) => ({
          title: promo.title,
          subtitle: promo.subtitle,
          href: promo.href,
          image: promo.image,
        }))
      : fallbackProducts.slice(0, 3).map((product) => ({
          title: product.badge ?? "Especial ATRES",
          subtitle: product.name,
          href: `/productos/${product.slug}`,
          image: product.image,
        }));

  if (!tiles.length) return null;

  return (
    <section className="catalog-container grid gap-2.5 py-3 sm:grid-cols-3 md:gap-3 md:py-4">
      {tiles.map((tile) => (
        <Link
          key={`${tile.href}-${tile.title}`}
          href={tile.href}
          className="group relative min-h-[120px] overflow-hidden rounded-[var(--radius-card)] bg-ink p-3.5 text-white sm:min-h-[140px] sm:p-4"
        >
          <SafeProductImage
            src={tile.image}
            alt={tile.title}
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover opacity-45 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="relative max-w-[90%]">
            <p className="break-words text-sm font-medium leading-tight sm:text-xl">{tile.title}</p>
            <p className="mt-2 line-clamp-2 text-xs font-normal leading-5 text-white/75 sm:text-sm">
              {tile.subtitle}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}

function EditorialGallery({ products }: { products: Product[] }) {
  if (!products.length) return null;
  const [featured, ...supporting] = products;

  return (
    <section className="catalog-container py-3 md:py-4" aria-labelledby="editorial-gallery-title">
      <div className="mb-2.5 flex items-end justify-between gap-3 md:mb-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-muted">Editorial</p>
          <h2 id="editorial-gallery-title" className="mt-0.5 text-xl font-medium tracking-tight text-ink md:text-2xl">
            Comprar por foto
          </h2>
        </div>
        <Link
          href="/productos"
          className="shrink-0 text-sm font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Ver catalogo
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr] md:gap-4">
        {featured ? <EditorialTile product={featured} featured /> : null}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {supporting.map((product) => (
            <EditorialTile key={`editorial-${product.slug}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EditorialTile({ product, featured = false }: { product: Product; featured?: boolean }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className={`group relative overflow-hidden rounded-[var(--radius-card)] bg-ink ${
        featured ? "min-h-[240px] md:min-h-[360px]" : "min-h-[140px] md:min-h-[180px]"
      }`}
    >
      <SafeProductImage
        src={product.image}
        alt={product.name}
        sizes={featured ? "(max-width: 768px) 100vw, 52vw" : "(max-width: 768px) 50vw, 22vw"}
        className="object-cover opacity-95 transition duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
      <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
        {product.isPromo ? <Badge tone="brand">Oferta</Badge> : null}
        {product.isNew ? <Badge tone="soft">Nuevo</Badge> : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
        <p className={`${featured ? "text-xl leading-6 sm:text-2xl" : "text-sm leading-5"} line-clamp-2 font-medium`}>
          {product.name}
        </p>
        <div className="mt-2.5">
          <ProductPrice
            price={product.price}
            previousPrice={product.previousPrice}
            className="inline-flex rounded-[var(--radius-card)] bg-white/92 px-2 py-1 text-ink backdrop-blur-sm"
            currentClassName={featured ? "text-base" : "text-sm"}
            previousClassName="mt-0 text-[10px]"
          />
        </div>
      </div>
    </Link>
  );
}

function FlashSection({ products }: { products: Product[] }) {
  const flashProducts = products.slice(0, 6);

  if (!flashProducts.length) return null;

  return (
    <section className="catalog-container py-3 md:py-4">
      <div className="mb-2.5 flex items-end justify-between gap-3 md:mb-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-brand">Ofertas</p>
          <h2 className="mt-0.5 text-xl font-medium tracking-tight text-ink md:text-2xl">
            Productos con precio especial
          </h2>
        </div>
        <Link
          href="/ofertas"
          className="text-sm font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Ver todo
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {flashProducts.map((product) => {
          const discount = getDiscountPercent(product);

          return (
            <Link
              key={`flash-${product.slug}`}
              href={`/productos/${product.slug}`}
              className="atres-interactive grid grid-cols-[88px_1fr] gap-3 rounded-[var(--radius-card)] bg-surface p-2 ring-1 ring-black/[0.05] sm:grid-cols-[104px_1fr] sm:p-2.5"
            >
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-surface-muted">
                <SafeProductImage
                  src={product.image}
                  alt={product.name}
                  sizes="104px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 py-0.5 sm:py-1">
                <div className="flex gap-1.5">
                  <Badge tone="brand">Oferta</Badge>
                  {discount ? <Badge tone="amber">-{discount}%</Badge> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-ink">
                  {product.name}
                </p>
                <ProductPrice price={product.price} previousPrice={product.previousPrice} className="mt-2" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CollectionGrid({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="catalog-container py-3 md:py-4">
      <div className="mb-2.5 flex items-end justify-between gap-3 md:mb-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-muted">Colecciones</p>
          <h2 className="mt-0.5 text-xl font-medium tracking-tight text-ink md:text-2xl">
            Comprar por estilo
          </h2>
        </div>
        <Link
          href="/productos"
          className="text-sm font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Explorar
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {products.map((product) => (
          <Link
            key={`collection-${product.collection}`}
            href={`/productos?coleccion=${encodeURIComponent(product.collection)}`}
            className="group relative min-h-[170px] overflow-hidden rounded-[var(--radius-card)] bg-ink p-3.5 text-white sm:min-h-[190px]"
          >
            <SafeProductImage
              src={product.image}
              alt={product.collection}
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover opacity-55 transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="relative flex h-full min-h-[168px] flex-col justify-end">
              <p className="break-words text-sm font-medium leading-tight sm:text-2xl">{product.collection}</p>
              <p className="mt-2 line-clamp-1 text-xs text-white/65">{product.categoryName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
