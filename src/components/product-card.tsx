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

function pickRandomProductImage(product: Product) {
  const gallery = Array.from(
    new Set([...(product.images ?? []), product.image].filter((image): image is string => Boolean(image))),
  );
  if (!gallery.length) return product.image;
  return gallery[Math.floor(Math.random() * gallery.length)] ?? product.image;
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
  const salesCount = getSalesCount(product);
  const displayImage = pickRandomProductImage(product);
  const hasOptions = sizes.length > 0 || swatches.length > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface transition duration-300 hover:shadow-soft motion-safe:hover:-translate-y-0.5">
      <div className="relative bg-surface-muted">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted">
            <SafeProductImage
              src={displayImage}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 30vw, (max-width: 1500px) 24vw, (max-width: 1800px) 19vw, 15vw"
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

      {/* Dense commercial info: photo → name → price+cart; meta secondary */}
      <div className="flex min-w-0 flex-col gap-0.5 px-1.5 pb-1.5 pt-1">
        <div className="flex items-center justify-between gap-1.5 leading-none">
          <p className="min-w-0 truncate text-[9px] font-medium tracking-wide text-ink-muted/80 sm:text-[10px]">
            {product.categoryName}
          </p>
          <p className="flex shrink-0 items-center gap-0.5 text-[9px] font-medium text-ink-muted sm:text-[10px]">
            <StarIcon />
            <span className="text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-ink-muted/45">·</span>
            <span className="text-ink-muted/75">{salesCount}</span>
          </p>
        </div>

        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-[12px] font-medium leading-[1.2] text-ink transition group-hover:text-ink sm:text-[13px] sm:leading-[1.22]">
            {product.name}
          </h3>
        </Link>

        {hasOptions ? (
          <div className="flex items-center justify-between gap-1.5 leading-none">
            {sizes.length > 0 ? (
              <p className="min-w-0 truncate text-[9px] font-normal text-ink-muted/85 sm:text-[10px]">
                {sizes.join(" · ")}
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

function getSalesCount(product: Product) {
  const base = product.isTrending ? 180 : product.isPromo ? 96 : product.isNew ? 64 : 42;
  const slugScore = Array.from(product.slug).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return base + (slugScore % 73);
}

function StarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-2.5 fill-amber-400 text-amber-400">
      <path d="m12 2.8 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 16.83l-5.5 2.89 1.05-6.12L3.1 9.27l6.15-.9L12 2.8Z" />
    </svg>
  );
}
