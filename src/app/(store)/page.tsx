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

export const metadata = {
  title: {
    absolute: "ATRES | Moda colombiana directa",
  },
  description:
    "Compra moda colombiana, novedades, ofertas y colecciones ATRES con una experiencia rapida tipo marketplace.",
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
  const bestSellers = trendingProducts.length ? trendingProducts : products;
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
        .filter((product) => product.collection)
        .map((product) => [product.collection, product]),
    ).values(),
  ).slice(0, 4);

  return (
    <main>
      <HeroSection product={heroProduct} promo={heroPromo} />
      <CategoryStrip
        categories={[
          { label: "Todo", href: "/productos" },
          ...categories.map((category) => ({
            label: category.shortName,
            href: `/categoria/${category.slug}`,
          })),
          { label: "Novedades", href: "/novedades" },
          { label: "Ofertas", href: "/ofertas" },
        ]}
      />
      <FlashSection products={promoProducts.length ? promoProducts : products} />
      <EditorialGallery products={editorialProducts} />
      <PromoGrid promos={promos} fallbackProducts={promoProducts} />
      <ProductRail title="Mas vendidos" href="/productos?orden=tendencias" products={bestSellers} priorityCount={4} />
      <ProductRail title="Novedades" href="/novedades" products={newProducts.length ? newProducts : products} />
      <CollectionGrid products={collections} />
      <ProductRail title="Recomendados para ti" href="/productos" products={recommended} />
      <StoreBenefits />
    </main>
  );
}

function uniqueProducts(items: Product[]) {
  return Array.from(new Map(items.map((product) => [product.slug, product])).values());
}

function HeroSection({
  product,
  promo,
}: {
  product?: Product;
  promo?: Promo;
}) {
  const image = promo?.image ?? product?.image ?? "/icono.png";

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <SafeProductImage
          src={image}
          alt=""
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,10,10,0.92)_0%,rgba(10,10,10,0.55)_48%,rgba(10,10,10,0.28)_100%)]" />
      </div>

      <div className="catalog-container relative flex min-h-[62vh] max-h-[820px] flex-col justify-end pb-10 pt-24 sm:min-h-[68vh] sm:pb-14 sm:pt-28 lg:min-h-[78vh] lg:pb-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.18em] text-white/65">MODA COLOMBIANA</p>
          <h1 className="mt-3 text-5xl font-medium leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl">
            ATRES
          </h1>
          <p className="mt-4 max-w-md text-sm font-normal leading-6 text-white/78 sm:mt-5 sm:text-base sm:leading-7">
            Del taller al cliente. Colecciones listas para comprar, con precios claros.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 sm:mt-8 sm:gap-3">
            <Link
              href="/productos"
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white px-5 text-sm font-medium text-ink hover:bg-surface-muted sm:min-h-12 sm:px-6"
            >
              Comprar ahora
            </Link>
            <Link
              href="/ofertas"
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white/10 px-5 text-sm font-medium text-white ring-1 ring-white/25 hover:bg-white/16 sm:min-h-12 sm:px-6"
            >
              Ver ofertas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryStrip({
  categories,
}: {
  categories: Array<{ label: string; href: string }>;
}) {
  return (
    <nav
      className="sticky top-[3.5rem] z-30 border-y border-black/[0.06] bg-surface/94 backdrop-blur-xl lg:top-[7.9rem]"
      aria-label="Categorias destacadas"
    >
      <div className="atres-scroll catalog-container flex gap-1.5 overflow-x-auto py-2 sm:gap-2">
        {categories.map((category, index) => (
          <Link
            key={`${category.href}-${category.label}`}
            href={category.href}
            className={
              index === 0
                ? "atres-interactive inline-flex min-h-8 shrink-0 items-center rounded-[var(--radius-card)] bg-ink px-3 text-xs font-medium text-white sm:min-h-9 sm:px-3.5"
                : "atres-interactive inline-flex min-h-8 shrink-0 items-center rounded-[var(--radius-card)] bg-transparent px-3 text-xs font-medium text-ink-muted ring-1 ring-black/8 hover:bg-surface-muted hover:text-ink sm:min-h-9 sm:px-3.5"
            }
          >
            <span className="text-current">{category.label}</span>
          </Link>
        ))}
      </div>
    </nav>
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
    <section className="catalog-container grid gap-3 py-5 sm:grid-cols-3 md:gap-4 md:py-7">
      {tiles.map((tile) => (
        <Link
          key={`${tile.href}-${tile.title}`}
          href={tile.href}
          className="group relative min-h-[140px] overflow-hidden rounded-[var(--radius-card)] bg-ink p-4 text-white sm:min-h-[160px] sm:p-5"
        >
          <SafeProductImage
            src={tile.image}
            alt=""
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover opacity-45 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="relative max-w-[80%]">
            <p className="text-lg font-medium leading-tight sm:text-xl">{tile.title}</p>
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
    <section className="catalog-container py-5 md:py-7" aria-labelledby="editorial-gallery-title">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-muted">Editorial</p>
          <h2 id="editorial-gallery-title" className="mt-1 text-2xl font-medium tracking-tight text-ink md:text-3xl">
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
        featured ? "min-h-[280px] md:min-h-[460px]" : "min-h-[168px] md:min-h-[222px]"
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
    <section className="catalog-container py-5 md:py-7">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-brand">Oferta Flash</p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight text-ink md:text-3xl">
            Precios para comprar hoy
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
                  <Badge tone="brand">Flash</Badge>
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
    <section className="catalog-container py-5 md:py-7">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-muted">Colecciones</p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight text-ink md:text-3xl">
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {products.map((product) => (
          <Link
            key={`collection-${product.collection}`}
            href={`/productos?coleccion=${encodeURIComponent(product.collection)}`}
            className="group relative min-h-[200px] overflow-hidden rounded-[var(--radius-card)] bg-ink p-4 text-white sm:min-h-[220px]"
          >
            <SafeProductImage
              src={product.image}
              alt=""
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover opacity-55 transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="relative flex h-full min-h-[168px] flex-col justify-end">
              <p className="text-xl font-medium leading-tight sm:text-2xl">{product.collection}</p>
              <p className="mt-2 line-clamp-1 text-xs text-white/65">{product.categoryName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
