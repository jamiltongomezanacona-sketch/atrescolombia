import Image from "next/image";
import Link from "next/link";
import { HomeCategorySection } from "@/components/home-category-section";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { QuickFilters } from "@/components/quick-filters";
import { StoreBenefits } from "@/components/store-benefits";
import { Button } from "@/components/ui/button";
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
  getStoreNavigation,
} from "@/lib/public-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, products, newProducts, promoProducts, promos, navItems] = await Promise.all([
    getPublicCategoriesForDisplay(),
    getPublicProducts(),
    getPublicNewProducts(),
    getPublicPromoProducts(),
    getPublicPromos(),
    getStoreNavigation(),
  ]);

  const heroPromo = promos[0];
  const promoCards = promos.slice(0, 3);
  const promoLabels = [
    {
      eyebrow: "Nueva coleccion",
      title: "Comprar ahora",
      subtitle: "Prendas seleccionadas para estrenar hoy.",
    },
    {
      eyebrow: "Ofertas del dia",
      title: "Hasta 40% OFF",
      subtitle: "Precios directos de temporada en productos elegidos.",
    },
    {
      eyebrow: "Compra directa",
      title: "Fabricacion colombiana",
      subtitle: "Del taller al cliente, con atencion por prenda o al por mayor.",
    },
  ];

  return (
    <main>
      <section className="relative isolate overflow-hidden border-b border-black/5 bg-black text-white">
        {heroPromo?.image ? (
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={heroPromo.image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/55" />
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,77,0,0.28),transparent_42%),radial-gradient(circle_at_80%_0%,rgba(255,234,97,0.16),transparent_36%)]" />
        )}
        <div className="store-container relative py-6 md:py-8 lg:py-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand">ATRES Colombia</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black leading-[0.98] tracking-tight sm:text-4xl md:text-5xl">
            {heroPromo?.title || "Hombre, Mujer, Niños y Hogar"}
          </h1>
          <p className="mt-3 max-w-lg text-sm font-semibold leading-6 text-white/75">
            {heroPromo?.subtitle ||
              "Moda 100% colombiana que conecta fabricantes grandes y pequenos directamente con cada cliente."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href={heroPromo?.href || "/productos"} variant="brand">
              Comprar ahora
            </Button>
            <Button href="/ofertas" variant="secondary">
              Ver ofertas
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-white/70 py-2 md:py-2.5">
        <QuickFilters items={navItems} />
      </section>

      {categories.length > 0 ? (
        <section className="soft-section store-container py-4 md:py-5" aria-label="Categorias">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand">Departamentos</p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-ink md:text-2xl">
                Hombre, Mujer, Niños y Hogar
              </h2>
            </div>
            <Link
              href="/categorias"
              className="shrink-0 text-sm font-black text-ink underline-offset-4 hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8 md:gap-3">
            {categories.map((category) => {
              const theme = getCategoryVisualTheme(category.slug, category.name);

              return (
                <Link key={category.slug} href={`/categoria/${category.slug}`} className="group text-center">
                  <div
                    className={`relative mx-auto aspect-square w-full max-w-[82px] overflow-hidden rounded-full p-1 shadow-soft ring-1 ring-white/70 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04] ${theme.washClass}`}
                  >
                    <div className="absolute inset-1 overflow-hidden rounded-full bg-white/85">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <p className="mx-auto mt-2 min-h-8 max-w-[96px] text-[11px] font-black capitalize leading-4 text-ink sm:text-xs">
                    {category.shortName}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {promoCards.length > 0 ? (
        <section className="store-container py-2 md:py-3" aria-label="Promociones">
          <div className="grid gap-3 md:grid-cols-3 md:gap-4">
            {promoCards.map((promo, index) => {
              const label = promoLabels[index] ?? promoLabels[0];

              return (
              <Link
                key={promo.title}
                href={promo.href}
                className={`${promo.tone} relative isolate min-h-[118px] overflow-hidden rounded-lg p-4 shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-lift`}
              >
                <div className="pointer-events-none absolute inset-0">
                  <Image
                    src={promo.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-[0.18] transition duration-500"
                  />
                </div>
                <div className="relative">
                  <p className="text-[11px] font-black uppercase tracking-wide opacity-70">{label.eyebrow}</p>
                  <p className="mt-1 text-xl font-black tracking-tight">{label.title}</p>
                  <p className="mt-1.5 max-w-xs text-sm font-bold opacity-75">{label.subtitle || promo.subtitle}</p>
                  <span className="mt-3 inline-flex rounded-full bg-black px-3 py-1.5 text-[11px] font-black uppercase text-white">
                    Comprar ahora
                  </span>
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
