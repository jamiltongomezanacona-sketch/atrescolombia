import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { SafeProductImage } from "@/components/safe-product-image";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "@/components/ui/product-price";
import {
  getCommercialBadge,
  getCommercialLine,
  getCommercialMeta,
  getCommercialTone,
  getToneClass,
  getTopRibbon,
} from "@/lib/product-merchandising";
import { getDiscountPercent, type Product } from "@/lib/store-data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

function meaningfulSizes(sizes: string[]) {
  return sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "unica" && value !== "u";
  });
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice =
    product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;
  const sizes = meaningfulSizes(product.sizes).slice(0, 4);
  const inStock = product.stock > 0;
  const visualTag = getCommercialBadge(product);
  const visualTone = getCommercialTone(product);
  const metaCopy = getCommercialMeta(product);
  const sellingLine = getCommercialLine(product, inStock);
  const ribbon = getTopRibbon(product);

  return (
    <article className="group flex h-full min-h-[304px] flex-col overflow-hidden rounded-md bg-white shadow-[0_10px_28px_rgba(18,18,18,0.045)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-soft sm:min-h-[358px]">
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1700px) 17vw, 14vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/15 via-black/5 to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
        </Link>

        {ribbon ? (
          <div className="absolute inset-x-0 top-0 flex h-7 items-center bg-[#ff4d00] px-2 text-[11px] font-black uppercase text-white shadow-sm">
            <span className="truncate">{ribbon}</span>
          </div>
        ) : null}

        <div className={`absolute right-2 ${ribbon ? "top-8" : "top-2"}`}>
          <FavoriteButton productSlug={product.slug} compact />
        </div>

        {visualTag ? (
          <div className={`absolute left-2 ${ribbon ? "top-8" : "top-2"}`}>
            <Badge tone="black" className={`text-[10px] ${getToneClass(visualTone)}`}>
              {visualTag}
            </Badge>
          </div>
        ) : null}

        {discount ? (
          <div className="absolute bottom-2 left-2">
            <Badge tone="brand" className="bg-[#ff4d00] text-[10px] text-white ring-1 ring-black/10">
              -{discount}%
            </Badge>
          </div>
        ) : null}

        {!inStock ? (
          <div className="absolute inset-x-2.5 bottom-2.5">
            <Badge tone="black" className="text-[11px] ring-1 ring-black/25">
              Agotado
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <p className="hidden truncate text-[10px] font-black uppercase tracking-[0.14em] text-stone-400 sm:block">
          {product.categoryName}
        </p>
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="mt-1 line-clamp-2 min-h-9 text-[13px] font-black leading-4 text-ink transition group-hover:text-black sm:min-h-10 sm:leading-5 md:text-sm">
            {product.name}
          </h3>
        </Link>

        {sizes.length > 0 ? (
          <p className="mt-2 hidden truncate text-[11px] font-semibold text-stone-500/90 sm:block">
            Tallas: {sizes.join(" / ")}
            {meaningfulSizes(product.sizes).length > sizes.length ? " +" : ""}
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-stone-500">
          <span className="text-amber-500" aria-hidden="true">
            &#9733;
          </span>
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-stone-300">|</span>
          <span className="truncate">{metaCopy}</span>
        </div>

        <div className="mt-auto flex min-h-11 items-end justify-between gap-2 pt-2 sm:min-h-12">
          <ProductPrice price={product.price} previousPrice={previousPrice} size="md" />
          <Link
            href={`/productos/${product.slug}`}
            className="hidden shrink-0 rounded-full bg-stone-100/80 px-2.5 py-1.5 text-[10px] font-black uppercase text-stone-600 transition hover:bg-black hover:text-white sm:inline-flex"
          >
            Shop
          </Link>
        </div>

        <p className={`mt-1 hidden text-[11px] font-bold sm:block ${inStock ? "text-emerald-700" : "text-stone-400"}`}>
          {sellingLine}
        </p>
      </div>
    </article>
  );
}
