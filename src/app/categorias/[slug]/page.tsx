import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SafeProductImage } from "@/components/safe-product-image";
import { SiteHeader } from "@/components/site-header";
import { TrendShowcase } from "@/components/trend-showcase";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import { getPublicCategories, getPublicProductsByCategory } from "@/lib/public-store";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await getPublicCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getPublicCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {};
  }

  return {
    title: `${category.name} | ATRES`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getPublicCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = await getPublicProductsByCategory(category.slug);
  const theme = getCategoryVisualTheme(category.slug, category.name);
  const trendProducts = categoryProducts.filter((product) => product.isTrending || product.isNew || product.isPromo);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f3f1] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className={`relative mb-5 overflow-hidden rounded-[6px] ${theme.washClass} shadow-[0_22px_70px_rgba(16,24,40,0.12)]`}>
          <SafeProductImage
            src={theme.heroImage}
            alt=""
            sizes="100vw"
            priority
            className="object-cover opacity-[0.18] blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/[0.18] via-white/[0.08] to-white/[0.42]" />
          <div className="relative grid gap-5 p-5 md:grid-cols-[1fr_0.85fr] md:p-8">
            <div className={`rounded-[6px] p-5 backdrop-blur-md ring-1 ${theme.panelClass}`}>
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${theme.accentClass}`}>
                {theme.eyebrow}
              </p>
              <h1 className={`mt-3 max-w-3xl text-4xl font-black leading-[0.96] tracking-tight md:text-6xl ${theme.textClass}`}>
                {category.name}
              </h1>
              <p className={`mt-4 max-w-2xl text-sm font-bold leading-6 md:text-base ${theme.mutedTextClass}`}>
                {theme.description || category.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {theme.chips.map((chip) => (
                  <span key={chip} className="rounded-full bg-white/25 px-3 py-1.5 text-[11px] font-black uppercase ring-1 ring-current/10">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid content-end gap-3">
              <div className={`rounded-[6px] p-4 backdrop-blur-md ring-1 ${theme.panelClass}`}>
                <p className={`text-xs font-black uppercase tracking-[0.18em] ${theme.accentClass}`}>Trends</p>
                <p className={`mt-2 text-3xl font-black leading-none ${theme.textClass}`}>{theme.trendTag}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Productos" value={categoryProducts.length} theme={theme} />
                <Stat label="Nuevos" value={categoryProducts.filter((product) => product.isNew).length} theme={theme} />
                <Stat label="Ofertas" value={categoryProducts.filter((product) => product.isPromo).length} theme={theme} />
              </div>
            </div>
          </div>
        </div>

        <TrendShowcase
          theme={theme}
          products={(trendProducts.length ? trendProducts : categoryProducts).slice(0, 4)}
          href={`/categoria/${category.slug}`}
          compact
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categoryProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}

function Stat({ label, value, theme }: { label: string; value: number; theme: ReturnType<typeof getCategoryVisualTheme> }) {
  return (
    <div className={`rounded-[6px] p-3 text-center backdrop-blur-md ring-1 ${theme.panelClass}`}>
      <p className={`text-2xl font-black ${theme.textClass}`}>{value}</p>
      <p className={`mt-1 text-[10px] font-black uppercase ${theme.mutedTextClass}`}>{label}</p>
    </div>
  );
}
