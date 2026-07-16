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
    <section className="store-container py-5 md:py-6">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-xl font-black tracking-tight text-ink md:text-2xl">{title}</h2>
        <Link href={href} className="text-sm font-black text-ink underline-offset-4 hover:underline">
          {linkLabel}
        </Link>
      </div>
      <div className="product-rail">
        {products.slice(0, 8).map((product, index) => (
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
