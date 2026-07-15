import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { SafeProductImage } from "@/components/safe-product-image";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "@/components/ui/product-price";
import { getDiscountPercent, type Product } from "@/lib/store-data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice =
    product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;

  return (
    <article className="group overflow-hidden rounded-lg bg-white/85 shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lift">
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-b-[5px] bg-surface-muted">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
        </Link>
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton productSlug={product.slug} compact />
        </div>
        {product.badge ? (
          <div className="absolute left-2.5 top-2.5">
            <Badge>{product.badge}</Badge>
          </div>
        ) : null}
        {discount ? (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge tone="brand">-{discount}%</Badge>
          </div>
        ) : null}
      </div>
      <div className="space-y-2.5 p-3.5">
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-ink transition group-hover:text-black sm:text-sm">
            {product.name}
          </h3>
        </Link>
        <div className="flex min-h-10 items-end justify-between gap-2">
          <ProductPrice price={product.price} previousPrice={previousPrice} />
          <span className="hidden shrink-0 rounded-full bg-stone-100/80 px-2 py-1 text-[10px] font-black uppercase text-stone-600 sm:inline-flex">
            Ver
          </span>
        </div>
      </div>
    </article>
  );
}
