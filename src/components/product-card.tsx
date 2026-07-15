import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { SafeProductImage } from "@/components/safe-product-image";
import { formatCOP, getDiscountPercent, type Product } from "@/lib/store-data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice = product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;

  return (
    <article className="group overflow-hidden rounded-[2px] bg-white shadow-[0_1px_0_rgba(18,18,18,0.06),0_10px_28px_rgba(18,18,18,0.04)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(18,18,18,0.10)]">
      <div className="relative bg-[#efedea]">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe7e1]">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 768px) 50vw, 25vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/[0.16] to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
        </Link>
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton productSlug={product.slug} compact />
        </div>
        {product.badge ? (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
            {product.badge}
          </span>
        ) : null}
        {discount ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#ff4d00] px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
            -{discount}%
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5 p-3">
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-[13px] font-bold leading-5 text-[#181818] transition group-hover:text-black">
            {product.name}
          </h3>
        </Link>
        <div className="flex min-h-10 items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-black leading-none text-[#ff4d00]">{formatCOP(product.price)}</p>
            {previousPrice ? (
              <p className="mt-1 text-xs font-semibold text-stone-400 line-through">{formatCOP(previousPrice)}</p>
            ) : null}
          </div>
          <span className="hidden shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[10px] font-black uppercase text-stone-600 sm:inline-flex">
            Ver
          </span>
        </div>
      </div>
    </article>
  );
}
