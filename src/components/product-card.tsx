import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { formatCOP, getDiscountPercent, type Product } from "@/lib/store-data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);

  return (
    <article className="group bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="absolute right-2 top-2">
          <FavoriteButton productSlug={product.slug} compact />
        </div>
        {product.badge ? (
          <span className="absolute left-2 top-2 bg-black px-2 py-1 text-[11px] font-black text-white shadow-sm">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-2.5">
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-stone-950">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-black text-orange-600">{formatCOP(product.price)}</p>
            {product.previousPrice ? (
              <p className="text-xs font-semibold text-stone-400 line-through">
                {formatCOP(product.previousPrice)}
              </p>
            ) : null}
          </div>
          {discount ? (
            <span className="bg-amber-100 px-2 py-1 text-[11px] font-black text-amber-900">
              -{discount}%
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
