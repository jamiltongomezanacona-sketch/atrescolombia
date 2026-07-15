import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { TrendShowcase } from "@/components/trend-showcase";
import { getCategoryVisualTheme } from "@/lib/category-visuals";
import {
  getPublicCategories,
  getPublicCategoryBySlug,
  getPublicProductsByCategory,
  getPublicSubcategories,
} from "@/lib/public-store";

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
  const category = await getPublicCategoryBySlug(slug);

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
  const category = await getPublicCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [categoryProducts, subcategories] = await Promise.all([
    getPublicProductsByCategory(category.slug),
    getPublicSubcategories(category.slug),
  ]);

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
        title={category.shortName}
        description={theme.description || category.description}
        showStats={{
          products: categoryProducts.length,
          news: categoryProducts.filter((product) => product.isNew).length,
          promos: categoryProducts.filter((product) => product.isPromo).length,
        }}
      />

      {subcategories.length > 0 ? (
        <section className="store-container pb-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/categoria/${category.slug}`}
              className="rounded-full bg-black px-4 py-2 text-xs font-black text-white"
            >
              Todo {category.shortName}
            </Link>
            {subcategories.map((child) => (
              <Link
                key={child.slug}
                href={`/categoria/${child.slug}`}
                className="rounded-full bg-white px-4 py-2 text-xs font-black text-stone-800 ring-1 ring-black/5 transition hover:bg-black hover:text-white"
              >
                {child.shortName}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="store-container py-6 md:py-8">
        {categoryProducts.length === 0 ? (
          <p className="text-sm font-semibold text-stone-500">
            No hay productos en esta categoria por ahora. Explora otras colecciones ATRES.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
            {categoryProducts.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
