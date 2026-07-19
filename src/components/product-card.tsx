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
  /** Denser commercial layout for catalog grids only. */
  compact?: boolean;
};

function meaningfulSizes(sizes: string[]) {
  return sizes.filter((size) => {
    const value = size.trim().toLowerCase();
    return value && value !== "unica" && value !== "unico" && value !== "u";
  });
}

export function ProductCard({ product, priority = false, compact = false }: ProductCardProps) {
  const discount = getDiscountPercent(product);
  const previousPrice =
    product.previousPrice && product.previousPrice > product.price ? product.previousPrice : null;
  const sizes = meaningfulSizes(product.sizes).slice(0, 4);
  const inStock = product.stock > 0;
  const ribbon = getTopRibbon(product);
  const visualTag = ribbon ? null : getCommercialBadge(product);
  const visualTone = getCommercialTone(product);
  const sizeLabel = getCompactSizeLabel(meaningfulSizes(product.sizes));
  const swatches = product.colors.filter(Boolean).slice(0, 3);
  const showDiscount = discount && !ribbon?.includes("%");
  const salesCount = getSalesCount(product);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface transition duration-300",
        compact ? "hover:shadow-soft" : "hover:-translate-y-0.5 hover:shadow-soft",
      )}
    >
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
            <SafeProductImage
              src={product.image}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 30vw, (max-width: 1500px) 24vw, (max-width: 1800px) 19vw, 15vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
          </div>
        </Link>

        {ribbon ? (
          <div
            className={cn(
              "absolute left-1.5 top-1.5 max-w-[72%] rounded-[var(--radius-card)] bg-brand font-medium text-white",
              compact ? "px-1.5 py-px text-[9px] sm:text-[10px]" : "left-2 top-2 px-2 py-0.5 text-[10px] sm:text-[11px]",
            )}
          >
            <span className="truncate">{ribbon}</span>
          </div>
        ) : null}

        <div
          className={cn(
            "absolute opacity-90 transition group-hover:opacity-100",
            compact ? "right-1 top-1" : "right-1.5 top-1.5",
          )}
        >
          <FavoriteButton productSlug={product.slug} compact />
        </div>

        {visualTag ? (
          <div className={cn("absolute", compact ? "left-1.5 top-1.5" : "left-2 top-2")}>
            <Badge
              tone="black"
              className={cn(getToneClass(visualTone), compact ? "px-1.5 py-px text-[9px]" : "text-[10px]")}
            >
              {visualTag}
            </Badge>
          </div>
        ) : null}

        {showDiscount ? (
          <div className={cn("absolute", compact ? "bottom-1.5 left-1.5" : "bottom-2 left-2")}>
            <Badge tone="brand" className={compact ? "px-1.5 py-px text-[9px]" : "text-[10px]"}>
              -{discount}%
            </Badge>
          </div>
        ) : null}

        {sizeLabel ? (
          <div
            className={cn(
              "absolute hidden rounded-[var(--radius-card)] bg-white/92 font-medium text-ink-muted backdrop-blur-sm sm:block",
              compact
                ? "bottom-1.5 right-1.5 px-1 py-px text-[9px]"
                : "bottom-2 right-2 px-1.5 py-0.5 text-[10px]",
            )}
          >
            {sizeLabel}
          </div>
        ) : null}

        {!inStock ? (
          <div className={cn("absolute inset-x-1.5", compact ? "bottom-1.5" : "inset-x-2 bottom-2")}>
            <Badge tone="black" className={compact ? "px-1.5 py-px text-[9px]" : "text-[10px]"}>
              Agotado
            </Badge>
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          compact ? "px-1.5 pb-1.5 pt-1 sm:px-1.5 sm:pb-1.5" : "px-2 pb-2 pt-2 sm:px-2.5 sm:pb-2.5",
        )}
      >
        {!compact ? (
          <div className="mb-1 hidden items-center justify-between gap-2 sm:flex">
            <p className="truncate text-[10px] font-medium tracking-wide text-ink-muted">{product.categoryName}</p>
            <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-ink-muted">
              <StarIcon />
              <span>{product.rating.toFixed(1)}</span>
              <span className="hidden text-stone-300 sm:inline">·</span>
              <span className="hidden text-ink-muted/80 lg:inline">{salesCount}</span>
            </div>
          </div>
        ) : null}

        <Link href={`/productos/${product.slug}`} className="block">
          <h3
            className={cn(
              "line-clamp-2 font-medium text-ink transition group-hover:text-ink",
              compact
                ? "text-[12px] leading-[1.2] sm:text-[13px] sm:leading-[1.25]"
                : "text-[13px] leading-[1.25] sm:min-h-10 sm:text-sm sm:leading-5",
            )}
          >
            {product.name}
          </h3>
        </Link>

        {!compact ? (
          <div className="mt-1 flex items-center justify-between gap-2">
            {sizes.length > 0 ? (
              <p className="truncate text-[10px] font-normal text-ink-muted/90 sm:text-[11px]">
                {sizes.join(" · ")}
                {meaningfulSizes(product.sizes).length > sizes.length ? " +" : ""}
              </p>
            ) : (
              <span />
            )}
            {swatches.length > 0 ? (
              <div className="hidden shrink-0 items-center gap-1 sm:flex" aria-label="Colores disponibles">
                {swatches.map((color) => (
                  <span
                    key={color}
                    title={color}
                    className="size-2.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: colorToHex(color) }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : sizes.length > 0 ? (
          <p className="mt-0.5 truncate text-[9px] font-normal text-ink-muted/85 sm:text-[10px]">
            {sizes.join(" · ")}
            {meaningfulSizes(product.sizes).length > sizes.length ? " +" : ""}
          </p>
        ) : null}

        <div className={cn("flex items-end justify-between gap-1.5", compact ? "mt-0.5" : "mt-1.5 sm:mt-2")}>
          <ProductPrice
            price={product.price}
            previousPrice={previousPrice}
            size="md"
            currentClassName={
              compact ? "text-[0.95rem] sm:text-base lg:text-[1.05rem]" : "text-lg sm:text-xl lg:text-[1.15rem]"
            }
            previousClassName={compact ? "mt-0 text-[9px] sm:text-[10px]" : "mt-0.5 text-[10px] sm:text-[11px]"}
          />
        </div>

        {!compact ? (
          <div className="mt-auto hidden pt-1.5 sm:block [&_a]:rounded-[var(--radius-card)] [&_a]:bg-transparent [&_a]:shadow-none [&_button]:min-h-8 [&_button]:rounded-[var(--radius-card)] [&_button]:bg-ink/90 [&_button]:text-[10px] [&_button]:font-medium [&_button]:shadow-none [&_button]:hover:bg-ink [&_div]:mt-0 [&_div]:gap-1 lg:[&_div]:grid-cols-1">
            <ProductCardActions product={product} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function getCompactSizeLabel(sizes: string[]) {
  if (!sizes.length) return null;
  const numeric = sizes
    .map((size) => Number(size))
    .filter((size) => Number.isFinite(size))
    .sort((a, b) => a - b);

  if (numeric.length >= 2 && numeric.length === sizes.length) {
    return `${numeric[0]}-${numeric[numeric.length - 1]}`;
  }

  return sizes.slice(0, 2).join("/");
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

function getSalesCount(product: Product) {
  const base = product.isTrending ? 180 : product.isPromo ? 96 : product.isNew ? 64 : 42;
  const slugScore = Array.from(product.slug).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return base + (slugScore % 73);
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3 fill-amber-400 text-amber-400">
      <path d="m12 2.8 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 16.83l-5.5 2.89 1.05-6.12L3.1 9.27l6.15-.9L12 2.8Z" />
    </svg>
  );
}
