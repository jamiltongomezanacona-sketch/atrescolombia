export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white/88 shadow-soft ring-1 ring-black/5" aria-hidden="true">
      <div className="atres-skeleton aspect-[3/4]" />
      <div className="space-y-2.5 p-3.5">
        <div className="atres-skeleton h-3 w-1/3 rounded" />
        <div className="atres-skeleton h-4 w-full rounded" />
        <div className="atres-skeleton h-4 w-2/3 rounded" />
        <div className="atres-skeleton h-5 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="catalog-grid">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
