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

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ATRES | Moda colombiana directa",
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
  const collections = Array.from(
    new Map(
      products
        .filter((product) => product.collection)
        .map((product) => [product.collection, product]),
    ).values(),
  ).slice(0, 4);

  return (
    <main>
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
      <HeroSection product={heroProduct} promo={heroPromo} productCount={products.length} />
      <PromoGrid promos={promos} fallbackProducts={promoProducts} />
      <ProductRail title="Mas vendidos" href="/productos?orden=tendencias" products={bestSellers} priorityCount={4} />
      <ProductRail title="Novedades" href="/novedades" products={newProducts.length ? newProducts : products} />
      <CollectionGrid products={collections} />
      <ProductRail title="Recomendados para ti" href="/productos" products={recommended} />
      <StoreBenefits />
    </main>
  );
}

function HeroSection({
  product,
  promo,
  productCount,
}: {
  product?: Product;
  promo?: Promo;
  productCount: number;
}) {
  const image = promo?.image ?? product?.image ?? "/icono.png";
  const href = promo?.href ?? (product ? `/productos/${product.slug}` : "/productos");

  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <SafeProductImage
          src={image}
          alt=""
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.58)_42%,rgba(0,0,0,0.2)_100%)]" />
      </div>

      <div className="catalog-container relative grid min-h-[260px] content-end gap-4 pb-5 pt-14 sm:min-h-[340px] sm:gap-6 sm:pb-8 sm:pt-20 md:grid-cols-[1fr_340px] md:items-end md:pb-10 lg:min-h-[500px]">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
            <Badge tone="brand">Oferta Flash</Badge>
            <Badge tone="amber">Nuevo drop</Badge>
            <Badge tone="emerald">{productCount} productos</Badge>
          </div>
          <h1 className="max-w-3xl text-3xl font-medium leading-none text-white sm:text-5xl lg:text-6xl">
            ATRES
          </h1>
          <p className="mt-3 max-w-xl text-sm font-normal leading-6 text-white/82 sm:mt-4 sm:text-lg sm:leading-7">
            Moda colombiana directa, colecciones listas para comprar y precios visibles para decidir rapido.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
            <Link
              href="/productos"
              className="atres-interactive inline-flex min-h-10 items-center justify-center rounded-full bg-white px-4 text-xs font-medium !text-black hover:bg-amber-100 sm:min-h-12 sm:px-5 sm:text-sm"
            >
              <span className="text-current">Comprar ahora</span>
            </Link>
            <Link
              href="/ofertas"
              className="atres-interactive inline-flex min-h-10 items-center justify-center rounded-full bg-white/10 px-4 text-xs font-medium text-white ring-1 ring-white/25 hover:bg-white/20 sm:min-h-12 sm:px-5 sm:text-sm"
            >
              Ver ofertas
            </Link>
          </div>
        </div>

        {product ? (
          <Link
            href={href}
            className="atres-interactive hidden overflow-hidden rounded-lg bg-white/92 p-2 text-black shadow-lift ring-1 ring-white/60 md:block"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-surface-muted">
              <SafeProductImage
                src={product.image}
                alt={product.name}
                sizes="340px"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
              <ProductPrice price={product.price} previousPrice={product.previousPrice} size="md" className="mt-2" />
            </div>
          </Link>
        ) : null}
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
    <nav className="sticky top-[3.5rem] z-30 border-y border-black/5 bg-white/94 shadow-sm backdrop-blur-xl lg:top-[7.9rem]" aria-label="Categorias destacadas">
      <div className="atres-scroll catalog-container flex gap-1.5 overflow-x-auto py-1.5 sm:gap-2 sm:py-2">
        {categories.map((category, index) => (
          <Link
            key={`${category.href}-${category.label}`}
            href={category.href}
            className={
              index === 0
                ? "atres-interactive inline-flex min-h-8 shrink-0 items-center rounded-full bg-black px-3 text-xs font-medium !text-white sm:min-h-9 sm:px-4"
                : "atres-interactive inline-flex min-h-8 shrink-0 items-center rounded-full bg-stone-100 px-3 text-xs font-medium text-stone-800 hover:bg-black hover:text-white sm:min-h-9 sm:px-4"
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
    <section className="catalog-container grid gap-2 py-3 sm:grid-cols-3 md:gap-3 md:py-5">
      {tiles.map((tile) => (
        <Link
          key={`${tile.href}-${tile.title}`}
          href={tile.href}
          className="group relative min-h-[104px] overflow-hidden rounded-lg bg-black p-3 text-white shadow-soft ring-1 ring-black/5 sm:min-h-[132px] sm:p-4"
        >
          <SafeProductImage
            src={tile.image}
            alt=""
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover opacity-50 transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/10" />
          <div className="relative max-w-[78%]">
            <p className="text-base font-medium leading-tight sm:text-lg">{tile.title}</p>
            <p className="mt-1.5 line-clamp-2 text-xs font-normal leading-5 text-white/80 sm:mt-2">{tile.subtitle}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}

function FlashSection({ products }: { products: Product[] }) {
  const flashProducts = products.slice(0, 6);

  if (!flashProducts.length) return null;

  return (
    <section className="catalog-container py-3 md:py-4">
      <div className="mb-2.5 flex items-end justify-between gap-3 md:mb-3">
        <div>
          <p className="text-xs font-medium text-brand">Oferta Flash</p>
          <h2 className="mt-1 text-xl font-medium leading-none text-ink md:text-2xl">Precios para comprar hoy</h2>
        </div>
        <Link href="/ofertas" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
          Ver todo
        </Link>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {flashProducts.map((product) => {
          const discount = getDiscountPercent(product);

          return (
            <Link
              key={`flash-${product.slug}`}
              href={`/productos/${product.slug}`}
              className="atres-interactive grid grid-cols-[96px_1fr] gap-3 rounded-lg bg-white/92 p-2 shadow-soft ring-1 ring-black/5"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-surface-muted">
                <SafeProductImage
                  src={product.image}
                  alt={product.name}
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 py-1">
                <div className="flex gap-1.5">
                  <Badge tone="brand">Flash</Badge>
                  {discount ? <Badge tone="amber">-{discount}%</Badge> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-normal leading-5 text-ink">{product.name}</p>
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
    <section className="catalog-container py-4 md:py-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-stone-500">Colecciones</p>
          <h2 className="mt-1 text-2xl font-medium leading-none text-ink">Comprar por estilo</h2>
        </div>
        <Link href="/productos" className="text-sm font-medium text-ink underline-offset-4 hover:underline">
          Explorar
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={`collection-${product.collection}`}
            href={`/productos?coleccion=${encodeURIComponent(product.collection)}`}
            className="group relative min-h-[190px] overflow-hidden rounded-lg bg-black p-4 text-white shadow-soft"
          >
            <SafeProductImage
              src={product.image}
              alt=""
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover opacity-60 transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="relative flex h-full min-h-[158px] flex-col justify-end">
              <p className="text-xl font-medium leading-tight">{product.collection}</p>
              <p className="mt-2 line-clamp-1 text-xs text-white/70">{product.categoryName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
