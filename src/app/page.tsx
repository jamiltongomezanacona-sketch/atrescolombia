import Image from "next/image";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
import { TrendShowcase } from "@/components/trend-showcase";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import {
  getPublicCategories,
  getPublicNewProducts,
  getPublicProducts,
  getPublicPromoProducts,
  getPublicPromos,
  getPublicTrendingProducts,
} from "@/lib/public-store";
import type { Product } from "@/lib/store-data";

export const dynamic = "force-dynamic";

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
  const homeTrendTheme = getCategoryVisualTheme("elegante", "Elegante");

  return (
    <main className="store-surface min-h-screen overflow-x-hidden pb-24 text-[#111]">
      <SiteHeader />

      <TrendShowcase theme={homeTrendTheme} products={heroProducts} href="/productos?orden=tendencias" />

      <section className="soft-section mx-auto max-w-[1350px] px-3 py-6 sm:px-4 md:py-8">
        <div className="relative grid grid-cols-4 gap-x-4 gap-y-7 sm:grid-cols-6 md:gap-y-8 lg:grid-cols-10">
          {categories.map((category) => {
            const theme = getCategoryVisualTheme(category.slug, category.name);

            return (
              <Link key={category.slug} href={`/categoria/${category.slug}`} className="group text-center">
                <div className={`mx-auto flex aspect-square w-full max-w-[106px] items-center justify-center overflow-hidden rounded-full p-1.5 shadow-[0_18px_38px_rgba(17,24,39,0.09)] ring-1 ring-white/60 transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 ${theme.washClass}`}>
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-white/55 backdrop-blur">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <p className="mx-auto mt-3 min-h-10 max-w-[120px] text-sm font-semibold leading-5 text-[#222]">
                  {category.shortName}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1350px] px-3 py-3 sm:px-4 md:py-5">
        <div className="grid gap-3 md:grid-cols-3 md:gap-4">
          {promos.map((promo) => (
            <Link
              key={promo.title}
              href={promo.href}
              className={`${promo.tone} relative min-h-[170px] overflow-hidden rounded-lg p-5 shadow-[0_18px_45px_rgba(18,18,18,0.08)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1`}
            >
              <Image
                src={promo.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-[0.18] blur-[0.5px] scale-105"
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

      <section className="mx-auto max-w-[1350px] px-3 py-7 sm:px-4 md:py-9">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-black md:text-3xl">Recomendados para ti</h2>
          <Link href="/productos" className="text-sm font-black text-black underline-offset-4 hover:underline">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      <BottomNav />
    </main>
  );
}

function ProductSection({ title, href, products }: { title: string; href: string; products: Product[] }) {
  return (
    <section className="mx-auto max-w-[1350px] px-3 py-7 sm:px-4 md:py-9">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-black tracking-tight text-black md:text-3xl">{title}</h2>
        <Link href={href} className="text-sm font-black text-black underline-offset-4 hover:underline">
          Ver mas
        </Link>
      </div>
      <div className="grid auto-cols-[46%] grid-flow-col gap-3.5 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[220px] md:gap-4">
        {products.map((product) => (
          <ProductCard key={`${title}-${product.slug}`} product={product} />
        ))}
      </div>
    </section>
  );
}
