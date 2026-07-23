import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { ProductCardActions } from "@/components/product-card-actions";
import { SafeProductImage } from "@/components/safe-product-image";
import { Badge } from "@/components/ui/badge";
import { ProductPrice } from "@/components/ui/product-price";
import { cn } from "@/lib/cn";
import {
  getCommercialBadge,
  getCommercialTone,
  getToneClass,
  getTopRibbon,
} from "@/lib/product-merchandising";
import { getDiscountPercent, type Product } from "@/lib/store-data";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  /** Kept for callers; catalog cards share one dense standard. */
  compact?: boolean;
};

function meaningfulSizes(sizes: string[]) {
  return sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "unico" && value !== "u";
  });
}
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice =
    product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;
  const sizes = meaningfulSizes(product.sizes).slice(0, 4);
  const inStock = product.stock > 0;
  const ribbon = getTopRibbon(product);
  const visualTag = ribbon ? null : getCommercialBadge(product);
  const visualTone = getCommercialTone(product);
  const swatches = product.colors.filter(Boolean).slice(0, 3);
  // Prefer ribbon ("Ahorra $…") over a second "-%" badge on the same image.
  const showDiscount = Boolean(discount) && !ribbon;
  const displayImage = product.image;
  const hasOptions = sizes.length > 0 || swatches.length > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface ring-1 ring-black/[0.04] transition duration-300 hover:shadow-soft hover:ring-black/[0.08] motion-safe:hover:-translate-y-0.5">
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
            <SafeProductImage
              src={displayImage}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, (max-width: 1536px) 17vw, (max-width: 1800px) 16vw, 14vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 transition duration-300 motion-safe:group-hover:opacity-100" />
          </div>
        </Link>

        {ribbon ? (
          <div className="absolute left-1.5 top-1.5 max-w-[72%] rounded-[var(--radius-card)] bg-brand px-1.5 py-px text-[9px] font-medium text-white sm:text-[10px]">
            <span className="truncate">{ribbon}</span>
          </div>
        ) : null}

        <div className="absolute right-1 top-1 opacity-90 transition group-hover:opacity-100">
          <FavoriteButton productSlug={product.slug} compact />
        </div>

        {visualTag ? (
          <div className="absolute left-1.5 top-1.5">
            <Badge tone="black" className={cn(getToneClass(visualTone), "px-1.5 py-px text-[9px]")}>
              {visualTag}
            </Badge>
          </div>
        ) : null}

        {showDiscount ? (
          <div className="absolute bottom-1.5 left-1.5">
            <Badge tone="brand" className="px-1.5 py-px text-[9px]">
              -{discount}%
            </Badge>
          </div>
        ) : null}

        {!inStock ? (
          <div className="absolute inset-x-1.5 bottom-1.5">
            <Badge tone="black" className="px-1.5 py-px text-[9px]">
              Agotado
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-1 px-2 pb-2 pt-1.5 sm:px-2.5 sm:pb-2.5">
        <div className="flex items-center justify-between gap-1.5 leading-none">
          <p className="min-w-0 truncate text-[9px] font-medium tracking-wide text-ink-muted/80 sm:text-[10px]">
            {product.categoryName}
          </p>
          {product.shopName ? (
            product.shopSlug ? (
              <Link
                href={`/tiendas/${product.shopSlug}`}
                className="min-w-0 shrink truncate text-right text-[9px] font-medium text-ink-muted/75 transition hover:text-ink sm:text-[10px]"
              >
                {product.shopName}
              </Link>
            ) : (
              <p className="min-w-0 shrink truncate text-right text-[9px] font-medium text-ink-muted/75 sm:text-[10px]">
                {product.shopName}
              </p>
            )
          ) : null}
        </div>

        {(product.shopCity || product.shopNeighborhood || product.shopLocality) && product.shopSlug ? (
          <Link
            href={`/tiendas/${product.shopSlug}`}
            className="flex min-w-0 items-center gap-1 text-[9px] font-medium text-ink-muted/80 transition hover:text-ink sm:text-[10px]"
          >
            <span aria-hidden="true" className="shrink-0">
              📍
            </span>
            <span className="truncate">
              {[product.shopCity, product.shopNeighborhood || product.shopLocality].filter(Boolean).join(" · ")}
            </span>
          </Link>
        ) : null}

        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 min-h-[2.05rem] text-[12px] font-medium leading-[1.24] text-ink transition group-hover:text-ink sm:min-h-[2.15rem] sm:text-[13px] sm:leading-[1.25]">
            {product.name}
          </h3>
        </Link>

        {hasOptions ? (
          <div className="flex items-center justify-between gap-1.5 leading-none">
            {sizes.length > 0 ? (
              <p className="min-w-0 truncate text-[9px] font-normal text-ink-muted/85 sm:text-[10px]">
                {sizes.join(" / ")}
                {meaningfulSizes(product.sizes).length > sizes.length ? " +" : ""}
              </p>
            ) : (
              <span />
            )}
            {swatches.length > 0 ? (
              <div className="flex shrink-0 items-center gap-0.5" aria-label="Colores disponibles">
                {swatches.map((color) => (
                  <span
                    key={color}
                    title={color}
                    aria-label={color}
                    className="size-2 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: colorToHex(color) }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <ProductPrice
            price={product.price}
            previousPrice={previousPrice}
            size="sm"
            className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0"
            currentClassName="text-[0.9rem] leading-none sm:text-[0.95rem]"
            previousClassName="mt-0 text-[9px] leading-none sm:text-[10px]"
          />
          <ProductCardActions product={product} />
        </div>
      </div>
    </article>
  );
}

function colorToHex(color: string) {
  const normalized = color
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("azul")) return "#2563eb";
  if (normalized.includes("rosa")) return "#f9a8d4";
  if (normalized.includes("lila") || normalized.includes("morado")) return "#a78bfa";
  if (normalized.includes("blanco")) return "#f8fafc";
  if (normalized.includes("negro")) return "#111827";
  if (normalized.includes("rojo")) return "#ef4444";
  if (normalized.includes("verde")) return "#22c55e";
  if (normalized.includes("amarillo")) return "#facc15";
  if (normalized.includes("beige") || normalized.includes("crema")) return "#e7d8bd";
  if (normalized.includes("gris")) return "#9ca3af";
  if (normalized.includes("denim")) return "#1d4ed8";
  return "#d6d3d1";
}
