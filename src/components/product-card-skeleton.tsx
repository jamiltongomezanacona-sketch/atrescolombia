export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white/80 ring-1 ring-black/5" aria-hidden="true">
      <div className="aspect-[3/4] animate-pulse bg-stone-200" />
      <div className="space-y-2.5 p-3.5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-full animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-stone-200" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
