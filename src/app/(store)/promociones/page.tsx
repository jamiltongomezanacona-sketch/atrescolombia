import { ProductCard } from "@/components/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { getPublicPromoProducts } from "@/lib/public-store";

export const metadata = {
  title: "Ofertas | ATRES",
  description: "Promociones y precios especiales ATRES Colombia.",
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const products = await getPublicPromoProducts();

  return (
    <main>
      <section className="store-container py-6 md:py-8">
        <PageHeader
          variant="promo"
          eyebrow="Precios especiales"
          title="Ofertas"
          description="Descuentos activos y promociones de temporada."
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
