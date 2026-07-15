import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicNewProducts } from "@/lib/public-store";

export const metadata = {
  title: "Novedades | ATRES",
  description: "Las prendas mas nuevas de ATRES Colombia.",
};

export const dynamic = "force-dynamic";

export default async function NewArrivalsPage() {
  const products = await getPublicNewProducts();

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader
          variant="dark"
          eyebrow="Recien llegado"
          title="Novedades"
          description="Prendas nuevas de temporada listas para descubrir."
        />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}
