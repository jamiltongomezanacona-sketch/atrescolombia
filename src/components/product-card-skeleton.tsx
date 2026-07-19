export function ProductCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[var(--radius-card)] bg-surface ring-1 ring-black/[0.04]"
      aria-hidden="true"
    >
      <div className="atres-skeleton aspect-[3/4] rounded-none" />
      <div className="space-y-2 p-2.5 sm:p-3">
        <div className="atres-skeleton h-2.5 w-1/3" />
        <div className="atres-skeleton h-3.5 w-full" />
        <div className="atres-skeleton h-3.5 w-2/3" />
        <div className="atres-skeleton mt-1 h-5 w-1/2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="catalog-grid-with-sidebar" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
