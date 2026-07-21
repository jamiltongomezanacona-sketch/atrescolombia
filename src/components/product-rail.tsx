import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/store-data";

type ProductRailProps = {
  title: string;
  href: string;
  products: Product[];
  linkLabel?: string;
  /** Eager-load first N cards (home above-fold only). Default 0. */
  priorityCount?: number;
};

export function ProductRail({
  title,
  href,
  products,
  linkLabel = "Ver mas",
  priorityCount = 0,
}: ProductRailProps) {
  if (!products.length) return null;

  return (
    <section className="catalog-container products-catalog-container py-3 md:py-4">
      <div className="mb-2 flex items-end justify-between gap-3">
        <h2 className="text-base font-medium tracking-tight text-ink sm:text-lg md:text-xl">{title}</h2>
        <Link
          href={href}
          className="text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline sm:text-sm"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="catalog-grid">
        {products.slice(0, 10).map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            priority={priorityCount > 0 && index < priorityCount}
          />
        ))}
      </div>
    </section>
  );
}
