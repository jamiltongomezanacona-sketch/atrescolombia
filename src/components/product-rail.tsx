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
  /** Home marketplace rails use a lighter grid without catalog field chrome. */
  variant?: "default" | "home";
};

export function ProductRail({
  title,
  href,
  products,
  subtitle,
  linkLabel = "Ver todo",
  priorityCount = 0,
  maxItems = 10,
  variant = "default",
}: ProductRailProps) {
  if (!products.length) return null;

  const isHome = variant === "home";

  return (
    <section className="home-section catalog-container products-catalog-container">
      <div className={`mb-2 flex items-end justify-between gap-3 ${isHome ? "sm:mb-3" : "sm:mb-2.5"}`}>
        <div className="min-w-0">
          <h2
            className={
              isHome
                ? "text-lg font-medium tracking-tight text-ink sm:text-xl md:text-2xl"
                : "text-base font-medium tracking-tight text-ink sm:text-lg md:text-xl"
            }
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs font-normal text-ink-muted sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link
          href={href}
          className={
            isHome
              ? "shrink-0 text-xs font-medium text-gold-light underline-offset-4 transition hover:underline sm:text-sm"
              : "shrink-0 text-xs font-medium text-ink-muted underline-offset-4 transition hover:text-ink hover:underline sm:text-sm"
          }
        >
          {linkLabel}
        </Link>
      </div>
      <div className={isHome ? "home-product-grid" : "catalog-grid"}>
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
