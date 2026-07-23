import Link from "next/link";
import { HomeCategoryPills } from "@/components/home/home-category-pills";
import { HomeFeaturedCollections } from "@/components/home/home-featured-collections";
import { HomeHero } from "@/components/home/home-hero";
import { HomeIdentityStrip } from "@/components/home/home-identity-strip";
import { HomePromotions } from "@/components/home/home-promotions";
import { HomeTrustStrip } from "@/components/home/home-trust-strip";
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
import { getDiscountPercent, type Product } from "@/lib/store-data";

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
    <main className="home-page">
      <HomeHero promos={promos} product={heroProduct} />
      <HomeCategoryPills categories={categories} />
      <HomeTrustStrip />
      <HomePromotions
        promos={promos}
        categories={categories}
        promoProducts={promoProducts}
        newProducts={newProducts}
      />
      <HomeFeaturedCollections
        categories={categories}
        collectionProducts={collections}
        promoProducts={promoProducts}
        newProducts={newProducts}
      />
      <HomeIdentityStrip />
      <ProductRail
        title="Destacados ATRES"
        subtitle="Seleccion actual para explorar primero."
        href="/productos?orden=tendencias"
        products={featuredProducts}
        maxItems={12}
      />
      <FlashSection products={promoProducts} />
      <ProductRail
        title="Novedades para ti"
        subtitle="Productos recientes en la vitrina."
        href="/novedades"
        products={newProducts.length ? newProducts : products}
        maxItems={12}
      />
      <EditorialGallery products={editorialProducts} />
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

function EditorialGallery({ products }: { products: Product[] }) {
  if (!products.length) return null;
  const [featured, ...supporting] = products;

  return (
    <section className="home-section catalog-container" aria-labelledby="editorial-gallery-title">
      <div className="mb-2 flex items-end justify-between gap-3 sm:mb-2.5">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-muted">Editorial</p>
          <h2 id="editorial-gallery-title" className="mt-0.5 text-lg font-medium tracking-tight text-ink sm:text-xl md:text-2xl">
            Comprar por foto
          </h2>
        </div>
        <Link
          href="/productos"
          className="shrink-0 text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline sm:text-sm"
        >
          Ver catalogo
        </Link>
      </div>

      <div className="grid gap-2.5 md:grid-cols-[1.2fr_0.8fr] md:gap-3">
        {featured ? <EditorialTile product={featured} featured /> : null}
        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
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
      className={`group relative overflow-hidden rounded-[var(--radius-card)] bg-ink ring-1 ring-black/[0.06] ${
        featured ? "min-h-[220px] md:min-h-[340px]" : "min-h-[132px] md:min-h-[168px]"
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
      <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-3.5">
        <p className={`${featured ? "text-lg leading-6 sm:text-2xl" : "text-sm leading-5"} line-clamp-2 font-medium`}>
          {product.name}
        </p>
        <div className="mt-2">
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
    <section className="home-section catalog-container">
      <div className="mb-2 flex items-end justify-between gap-3 sm:mb-2.5">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-brand">Ofertas</p>
          <h2 className="mt-0.5 text-lg font-medium tracking-tight text-ink sm:text-xl md:text-2xl">
            Productos con precio especial
          </h2>
        </div>
        <Link
          href="/ofertas"
          className="text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline sm:text-sm"
        >
          Ver todo
        </Link>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {flashProducts.map((product) => {
          const discount = getDiscountPercent(product);

          return (
            <Link
              key={`flash-${product.slug}`}
              href={`/productos/${product.slug}`}
              className="atres-interactive grid grid-cols-[84px_1fr] gap-2.5 rounded-[var(--radius-card)] bg-surface p-2 ring-1 ring-black/[0.05] sm:grid-cols-[96px_1fr] sm:p-2.5"
            >
              <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-surface-muted">
                <SafeProductImage src={product.image} alt={product.name} sizes="96px" className="object-cover" />
              </div>
              <div className="min-w-0 py-0.5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone="brand">Oferta</Badge>
                  {discount ? <Badge tone="amber">-{discount}%</Badge> : null}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-5 text-ink">{product.name}</p>
                <ProductPrice price={product.price} previousPrice={product.previousPrice} className="mt-1.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
