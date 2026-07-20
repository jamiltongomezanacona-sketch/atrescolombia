import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicPromoProducts } from "@/lib/public-store";

export const metadata = {
  title: "Ofertas",
  description: "Promociones y precios especiales ATRES Colombia.",
};

export default async function OffersPage() {
  const products = await getPublicPromoProducts();

  return (
    <main>
      <section className="catalog-container py-6 md:py-8">
        <PageHeader
          variant="promo"
          eyebrow="Precios especiales"
          title="Ofertas"
          description="Descuentos activos y promociones de temporada."
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
