import Image from "next/image";
import Link from "next/link";
import { HomeCategorySection } from "@/components/home-category-section";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { StoreBenefits } from "@/components/store-benefits";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import {
  filterProductsByDepartmentKeys,
  HOME_DEPARTMENT_SECTIONS,
} from "@/lib/store-navigation";
import {
  getPublicCategoriesForDisplay,
  getPublicNewProducts,
  getPublicProducts,
  getPublicPromoProducts,
  getPublicPromos,
} from "@/lib/public-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, products, newProducts, promoProducts, promos] = await Promise.all([
    getPublicCategoriesForDisplay(),
    getPublicProducts(),
    getPublicNewProducts(),
    getPublicPromoProducts(),
    getPublicPromos(),
  ]);

  const heroPromo = promos[0];
  const promoCards = promos.slice(0, 2);
  const promoLabels = [
    {
      eyebrow: "Seleccion nueva",
      title: "Prendas listas para estrenar",
      subtitle: "Una vitrina limpia con novedades y favoritos ATRES.",
    },
    {
      eyebrow: "Precio directo",
      title: "Ofertas seleccionadas",
      subtitle: "Piezas de temporada con compra rapida por WhatsApp.",
    },
  ];

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-black/5 bg-stone-950 text-white">
        {heroPromo?.image ? (
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={heroPromo.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-42"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/68 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#111111_0%,#2c2926_55%,#f5efe6_100%)]" />
        )}

        <div className="store-container relative flex min-h-[300px] items-end py-8 md:min-h-[430px] md:py-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/72">
              ATRES Colombia
            </p>
            <h1 className="mt-3 max-w-xl text-3xl font-black leading-[1.02] tracking-tight sm:text-4xl md:text-5xl">
              Moda y hogar colombiano, directo para ti.
            </h1>
            <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-white/76 md:text-base">
              Prendas, sabanas, cobijas y accesorios seleccionados con una compra simple y atencion directa.
            </p>
            <Link
              href="/productos"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-black shadow-sm transition hover:bg-stone-100"
            >
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="store-container py-6 md:py-8" aria-label="Categorias">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand">Departamentos</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink md:text-3xl">
                Comprar por categoria
              </h2>
            </div>
            <Link
              href="/categorias"
              className="shrink-0 text-sm font-black text-ink underline-offset-4 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {categories.map((category) => {
              const theme = getCategoryVisualTheme(category.slug, category.name);

              return (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="group relative min-h-[142px] overflow-hidden rounded-lg bg-black shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:min-h-[172px]"
                >
                  <Image
                    src={theme.heroImage}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover opacity-72 transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/22 to-transparent" />
                  <div className="relative flex h-full min-h-[142px] flex-col justify-end p-3 sm:min-h-[172px] sm:p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/68">
                      {theme.eyebrow}
                    </p>
                    <h3 className="mt-1 text-xl font-black leading-none tracking-tight text-white sm:text-2xl">
                      {category.shortName}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {promoCards.length > 0 ? (
        <section className="store-container pb-3 md:pb-4" aria-label="Promociones">
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            {promoCards.map((promo, index) => {
              const label = promoLabels[index] ?? promoLabels[0];

              return (
                <Link
                  key={`${promo.title}-${index}`}
                  href={promo.href}
                  className="group relative isolate min-h-[104px] overflow-hidden rounded-lg bg-white p-4 shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <Image
                      src={promo.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover opacity-[0.16] transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-y-0 left-0 w-1 bg-brand" />
                  <div className="relative max-w-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">
                      {label.eyebrow}
                    </p>
                    <p className="mt-1 text-xl font-black leading-tight tracking-tight text-ink">
                      {label.title}
                    </p>
                    <p className="mt-1 max-w-sm text-sm font-semibold leading-5 text-stone-600">
                      {label.subtitle || promo.subtitle}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <div id="seccion-novedades" className="scroll-mt-32 md:scroll-mt-28">
        <ProductRail
          title="Novedades"
          href="/novedades"
          products={newProducts}
          linkLabel="Ver novedades"
          priorityCount={2}
        />
      </div>

      {HOME_DEPARTMENT_SECTIONS.map((section) => {
        const sectionProducts = filterProductsByDepartmentKeys(products, [section.key]);

        return (
          <HomeCategorySection
            key={section.id}
            id={section.id}
            title={section.title}
            href={section.href}
            products={sectionProducts}
          />
        );
      })}

      <div id="seccion-ofertas" className="scroll-mt-32 md:scroll-mt-28">
        <ProductRail title="Ofertas" href="/ofertas" products={promoProducts} linkLabel="Ver ofertas" />
      </div>

      <StoreBenefits />

      {products.length > 0 ? (
        <section className="store-container py-5 md:py-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className="text-xl font-black tracking-tight text-ink md:text-2xl">Recomendados para ti</h2>
            <Link href="/productos" className="text-sm font-black text-ink underline-offset-4 hover:underline">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {products.slice(0, 12).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
