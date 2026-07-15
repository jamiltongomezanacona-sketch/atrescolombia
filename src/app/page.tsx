import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicCategories,
  getPublicNewProducts,
  getPublicProducts,
  getPublicPromoProducts,
  getPublicPromos,
  getPublicTrendingProducts,
} from "@/lib/public-store";
import {
  formatCOP,
  type Product,
} from "@/lib/store-data";

export default async function Home() {
  const [categories, products, trendingProducts, newProducts, promoProducts, promos] =
    await Promise.all([
      getPublicCategories(),
      getPublicProducts(),
      getPublicTrendingProducts(),
      getPublicNewProducts(),
      getPublicPromoProducts(),
      getPublicPromos(),
    ]);
  const heroProducts = trendingProducts.slice(0, 4);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />

      <section className="mx-auto max-w-[1350px] px-3 py-3 sm:px-4">
        <div className="relative grid overflow-hidden bg-[#ead7ff] shadow-sm md:grid-cols-[0.72fr_1.7fr]">
          <div className="absolute inset-0 text-[150px] font-black leading-none tracking-tight text-white/30 md:text-[280px]">
            ATRES
          </div>
          <div className="relative min-h-[255px] overflow-hidden bg-[#7b4df1] px-5 py-7 text-white md:px-8 md:py-10">
            <Image
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 35vw"
              className="object-cover opacity-22 blur-[1px]"
            />
            <div className="relative max-w-sm">
              <p className="text-sm font-black uppercase tracking-wide text-amber-200">
                Nueva temporada
              </p>
              <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-tight md:text-5xl">
                Moda ATRES con precio de tendencia.
              </h1>
              <p className="mt-4 text-base font-bold leading-6 text-white/88">
                Descubre categorias, ofertas y novedades en una sola tienda.
              </p>
              <Link
                href="/productos"
                className="mt-6 inline-flex bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-amber-200"
              >
                Comprar ahora
              </Link>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 md:gap-5 md:p-7">
            {heroProducts.map((product) => (
              <HeroProduct key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="grid grid-cols-4 gap-x-4 gap-y-7 sm:grid-cols-6 lg:grid-cols-10">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categoria/${category.slug}`} className="group text-center">
              <div className="mx-auto flex aspect-square w-full max-w-[106px] items-center justify-center overflow-hidden rounded-full bg-[#eceae7] transition group-hover:scale-105">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={180}
                  height={180}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mx-auto mt-3 min-h-10 max-w-[120px] text-sm font-semibold leading-5 text-[#222]">
                {category.shortName}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-3 py-2 sm:px-4">
        <div className="grid gap-3 md:grid-cols-3">
          {promos.map((promo) => (
            <Link
              key={promo.title}
              href={promo.href}
              className={`${promo.tone} relative min-h-[160px] overflow-hidden p-5 shadow-sm transition hover:-translate-y-0.5`}
            >
              <Image
                src={promo.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-20"
              />
              <div className="relative">
                <p className="text-2xl font-black tracking-tight">{promo.title}</p>
                <p className="mt-2 max-w-xs text-sm font-bold opacity-75">{promo.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Novedades" href="/novedades" products={newProducts} />
      <ProductSection title="Tendencias" href="/productos?orden=tendencias" products={trendingProducts} />
      <ProductSection title="Mas vendidos" href="/productos" products={products.slice(0, 6)} />
      <ProductSection title="Precios especiales" href="/ofertas" products={promoProducts} />
      <ProductSection title="Productos destacados" href="/productos" products={products.slice(4, 10)} />

      <section className="mx-auto max-w-[1350px] px-3 py-6 sm:px-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-black">Recomendados para ti</h2>
          <Link href="/productos" className="text-sm font-black text-black underline-offset-4 hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function HeroProduct({ product }: { product: Product }) {
  return (
    <Link href={`/productos/${product.slug}`} className="relative overflow-hidden border-[6px] border-white/75 bg-white shadow-sm">
      <div className="relative aspect-[3/4]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 45vw, 180px"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-x-2 bottom-2 bg-white/92 px-2 py-1 text-center text-lg font-black text-orange-600 shadow-sm">
        {formatCOP(product.price)}
      </div>
    </Link>
  );
}

function ProductSection({ title, href, products }: { title: string; href: string; products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1350px] px-3 py-6 sm:px-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-black">{title}</h2>
        <Link href={href} className="text-sm font-black text-black underline-offset-4 hover:underline">
          Ver mas
        </Link>
      </div>
      <div className="grid auto-cols-[46%] grid-flow-col gap-3 overflow-x-auto pb-1 [scrollbar-width:none] sm:auto-cols-[220px]">
        {products.map((product) => (
          <ProductCard key={`${title}-${product.slug}`} product={product} />
        ))}
      </div>
    </section>
  );
}
