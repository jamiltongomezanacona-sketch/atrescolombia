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
      <HomeTrustStrip />
      <ProductRail title="Mas vendidos" href="/productos?orden=tendencias" products={bestSellers} priorityCount={4} />
      <FlashSection products={promoProducts.length ? promoProducts : products} />
      <EditorialGallery products={editorialProducts} />
      <PromoGrid promos={promos} fallbackProducts={promoProducts} />
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
          className="object-cover object-[center_28%] opacity-70 sm:object-[center_24%] lg:object-[72%_28%] lg:opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,10,10,0.82)_0%,rgba(10,10,10,0.42)_46%,rgba(10,10,10,0.12)_100%)]" />
      </div>

      <div className="catalog-container relative flex min-h-[420px] max-h-[560px] flex-col justify-end pb-7 pt-20 sm:min-h-[460px] sm:pb-9 sm:pt-24 lg:min-h-[520px] lg:pb-10 lg:pt-16">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="text-[11px] font-medium tracking-[0.18em] text-white/80">MODA COLOMBIANA</p>
          <h1 className="mt-2.5 text-4xl font-medium leading-[0.94] tracking-tight text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.35)] sm:mt-3 sm:text-5xl lg:text-6xl">
            ATRES
          </h1>
          <p className="mt-3 max-w-md text-sm font-medium leading-6 text-white sm:mt-4 sm:text-base sm:leading-7">
            Moda colombiana directamente del taller.
          </p>
          <p className="mt-1.5 max-w-md text-sm font-normal leading-6 text-white/78 sm:mt-2 sm:leading-7">
            Colecciones listas para comprar, con precios claros y atencion directa.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
            <Link
              href="/productos"
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              Comprar ahora
            </Link>
            <Link
              href="/ofertas"
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white/10 px-5 text-sm font-medium text-white ring-1 ring-white/30 transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
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
      <div className="atres-scroll catalog-container flex gap-2 overflow-x-auto py-2.5 sm:gap-2.5 sm:py-3">
        {categories.map((category, index) => (
          <Link
            key={`${category.href}-${category.label}`}
            href={category.href}
            className={
              index === 0
                ? "atres-interactive inline-flex min-h-9 shrink-0 items-center rounded-[var(--radius-card)] bg-ink px-3.5 text-xs font-medium text-white transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:min-h-10 sm:px-4"
                : "atres-interactive inline-flex min-h-9 shrink-0 items-center rounded-[var(--radius-card)] bg-transparent px-3.5 text-xs font-medium text-ink-muted ring-1 ring-black/10 transition hover:bg-surface-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:min-h-10 sm:px-4"
            }
          >
            <span className="text-current">{category.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function HomeTrustStrip() {
  const items = [
    { label: "Producto colombiano", icon: "flag" as const },
    { label: "Compra directa", icon: "direct" as const },
    { label: "Atencion por WhatsApp", icon: "chat" as const },
    { label: "Tiendas independientes", icon: "store" as const },
  ];

  return (
    <section className="border-b border-black/[0.06] bg-surface" aria-label="Confianza ATRES">
      <ul className="catalog-container grid grid-cols-2 gap-2 py-3 sm:grid-cols-4 sm:gap-3 sm:py-3.5">
        {items.map((item) => (
          <li
            key={item.label}
            className="flex min-h-10 items-center gap-2 rounded-[var(--radius-card)] px-1.5 text-ink sm:min-h-11 sm:justify-center sm:px-2"
          >
            <TrustIcon type={item.icon} />
            <span className="text-[11px] font-medium leading-4 text-ink sm:text-xs">{item.label}</span>
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
    <section className="catalog-container grid gap-3 py-4 sm:grid-cols-3 md:gap-4 md:py-5">
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
    <section className="catalog-container py-4 md:py-5" aria-labelledby="editorial-gallery-title">
      <div className="mb-3 flex items-end justify-between gap-3 md:mb-4">
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
    <section className="catalog-container py-4 md:py-5">
      <div className="mb-3 flex items-end justify-between gap-3 md:mb-4">
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
