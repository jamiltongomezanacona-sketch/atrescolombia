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

function meaningfulSizes(sizes: string[]) {
  return sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "única" && value !== "u";
  });
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice =
    product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;
  const sizes = meaningfulSizes(product.sizes).slice(0, 4);
  const inStock = product.stock > 0;

  return (
    <article className="group overflow-hidden rounded-lg bg-white/85 shadow-soft ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lift">
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-b-[5px] bg-surface-muted">
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
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton productSlug={product.slug} compact />
        </div>
        {product.badge ? (
          <div className="absolute left-2.5 top-2.5">
            <Badge tone="black" className="text-[11px] ring-1 ring-black/25">
              {product.badge}
            </Badge>
          </div>
        ) : null}
        {discount ? (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge tone="brand" className="bg-brand text-[11px] text-white ring-1 ring-black/20">
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
      <div className="space-y-1.5 p-2.5 sm:space-y-2 sm:p-3.5">
        <p className="hidden truncate text-xs font-black uppercase tracking-wide text-stone-500 sm:block">
          {product.categoryName}
        </p>
        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-9 text-xs font-semibold leading-4 text-ink transition group-hover:text-black sm:min-h-10 sm:leading-5 md:text-sm">
            {product.name}
          </h3>
        </Link>
        {sizes.length > 0 ? (
          <p className="hidden truncate text-[11px] font-semibold text-stone-500 sm:block">
            Tallas: {sizes.join(" · ")}
            {meaningfulSizes(product.sizes).length > sizes.length ? " +" : ""}
          </p>
        ) : null}
        <div className="flex min-h-9 items-end justify-between gap-2 sm:min-h-10">
          <ProductPrice price={product.price} previousPrice={previousPrice} />
          <Link
            href={`/productos/${product.slug}`}
            className="hidden shrink-0 rounded-full bg-stone-100/80 px-2.5 py-1.5 text-[10px] font-black uppercase text-stone-700 transition hover:bg-black hover:text-white sm:inline-flex"
          >
            Ver
          </Link>
        </div>
        <p className={`hidden text-[11px] font-bold sm:block ${inStock ? "text-emerald-700" : "text-stone-400"}`}>
          {inStock ? "Disponible" : "Sin stock"}
        </p>
      </div>
    </article>
  );
}
