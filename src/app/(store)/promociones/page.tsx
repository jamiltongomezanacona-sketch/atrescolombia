import { ProductCard } from "@/components/product-card";
import { getPublicPromoProducts } from "@/lib/public-store";

export const metadata = {
  title: "Ofertas",
  description: "Promociones y precios especiales ATRES Colombia.",
};

export default async function OffersPage() {
  const products = await getPublicPromoProducts();

  return (
    <main>
      <section className="catalog-container products-catalog-container pb-3 pt-1 md:pb-4 md:pt-1.5">
        <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-white/10 pb-2 sm:mb-2.5 lg:mb-3 lg:pb-2.5">
          <h1 className="text-base font-medium tracking-tight text-ink sm:text-lg lg:text-xl">Ofertas</h1>
          <p className="text-xs font-medium text-ink-muted">
            {products.length} producto{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="catalog-grid">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}
