import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/store-data";

type ProductRailProps = {
  title: string;
  href: string;
  products: Product[];
  subtitle?: string;
  linkLabel?: string;
  /** Eager-load first N cards (home above-fold only). Default 0. */
  priorityCount?: number;
  maxItems?: number;
};

export function ProductRail({
  title,
  href,
  products,
  subtitle,
  linkLabel = "Ver todo",
  priorityCount = 0,
  maxItems = 10,
}: ProductRailProps) {
  if (!products.length) return null;

  return (
    <section className="home-section catalog-container products-catalog-container">
      <div className="mb-2 flex items-end justify-between gap-3 sm:mb-2.5">
        <div className="min-w-0">
          <h2 className="text-base font-medium tracking-tight text-ink sm:text-lg md:text-xl">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs font-normal text-ink-muted sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link
          href={href}
          className="shrink-0 text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline sm:text-sm"
        >
          {linkLabel}
        </Link>
      </div>
      <div className="catalog-grid">
        {products.slice(0, maxItems).map((product, index) => (
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
