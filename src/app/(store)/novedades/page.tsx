import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicNewProducts } from "@/lib/public-store";

export const metadata = {
  title: "Novedades",
  description: "Las prendas mas nuevas de ATRES Colombia.",
};

export default async function NewArrivalsPage() {
  const products = await getPublicNewProducts();

  return (
    <main>
      <section className="catalog-container py-3 md:py-4">
        <PageHeader
          variant="dark"
          eyebrow="Recien llegado"
          title="Novedades"
          description="Prendas nuevas de temporada listas para descubrir."
        />
        <div className="catalog-grid">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}
