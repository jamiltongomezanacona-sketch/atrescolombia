import { notFound } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { ProductCard } from "@/components/product-card";
import { SiteHeader } from "@/components/site-header";
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f3f3f3] pb-24 text-[#111]">
      <SiteHeader />
      <section className="mx-auto max-w-[1350px] px-3 py-5 sm:px-4">
        <div className="mb-5 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-stone-500">Categoria</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-500">
            {category.description}
          </p>
        </div>
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
