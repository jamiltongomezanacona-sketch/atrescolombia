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
    title: category.name,
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
        compact
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
        <section className="catalog-container products-catalog-container pb-1.5 md:pb-3" aria-label="Subcategorias">
          <p className="mb-1 text-xs font-medium text-ink-muted md:mb-2">
            Subcategorias
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] md:flex-wrap md:gap-2 [&::-webkit-scrollbar]:hidden">
            <Link
              href={`/categoria/${category.slug}`}
              className="shrink-0 rounded-full bg-gold px-3 py-1.5 text-xs font-medium text-black-main shadow-sm md:px-4 md:py-2"
            >
              <span>Todo {category.shortName}</span>
            </Link>
            {subcategories.map((child) => (
              <Link
                key={child.slug}
                href={`/categoria/${child.slug}`}
                className="theme-secondary-button shrink-0 rounded-full px-3 py-1.5 text-xs font-medium md:px-4 md:py-2"
              >
                {child.shortName}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="catalog-container products-catalog-container py-2 md:py-3">
        {categoryProducts.length === 0 ? (
          <p className="text-sm font-normal text-ink-muted">
            No hay productos en esta categoria por ahora. Explora otras colecciones ATRES.
          </p>
        ) : (
          <div className="catalog-grid">
            {categoryProducts.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
