import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { TrendShowcase } from "@/components/trend-showcase";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import { getPublicCategories, getPublicProductsByCategory } from "@/lib/public-store";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

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
  const trendProducts = categoryProducts.filter(
    (product) => product.isTrending || product.isNew || product.isPromo,
  );

  return (
    <main>
      <TrendShowcase
        theme={theme}
        products={(trendProducts.length ? trendProducts : categoryProducts).slice(0, 4)}
        href={`/categoria/${category.slug}`}
        title={category.name}
        description={theme.description || category.description}
        showStats={{
          products: categoryProducts.length,
          news: categoryProducts.filter((product) => product.isNew).length,
          promos: categoryProducts.filter((product) => product.isPromo).length,
        }}
      />

      <section className="store-container py-6 md:py-8">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {categoryProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}
