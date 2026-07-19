import { ProductGridSkeleton } from "@/components/product-card-skeleton";

export default function ProductsLoading() {
  return (
    <main className="atres-fade-in">
      <section className="catalog-container products-catalog-container pb-4 pt-3 md:pb-5 md:pt-4">
        <div className="mb-4 space-y-2">
          <div className="atres-skeleton h-3 w-28" />
          <div className="atres-skeleton h-8 w-48 max-w-full" />
        </div>
        <div className="mb-4 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="atres-skeleton h-8 w-20 shrink-0" />
          ))}
        </div>
        <ProductGridSkeleton count={10} />
      </section>
    </main>
  );
}
