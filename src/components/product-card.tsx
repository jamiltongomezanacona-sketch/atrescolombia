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
  const placeLabel = [product.shopCity, product.shopNeighborhood || product.shopLocality]
    .filter(Boolean)
    .join(" · ");
  const shopName = product.shopName?.trim() || "";
  const shopLine = shopName
    ? placeLabel
      ? `${shopName} · ${placeLabel}`
      : shopName
    : "";

  return (
    <article className="store-card group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] motion-safe:hover:-translate-y-0.5">
      <div className="relative bg-surface-muted/80">
        <Link href={`/productos/${product.slug}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface-muted/90">
            <SafeProductImage
              src={displayImage}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, (max-width: 1536px) 17vw, (max-width: 1800px) 16vw, 14vw"
              priority={priority}
              className="h-full w-full object-cover transition duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(28,28,32,0.18)] via-transparent to-transparent opacity-0 transition duration-300 motion-safe:group-hover:opacity-100" />
          </div>
        </Link>

        {ribbon ? (
          <div className="absolute left-1.5 top-1.5 max-w-[72%] rounded-[var(--radius-card)] bg-black-main px-1.5 py-px text-[9px] font-semibold tracking-wide text-badge-gold ring-1 ring-gold-light/30 sm:text-[10px]">
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

      <div className="flex min-w-0 flex-col gap-0.5 px-2 pb-2 pt-1.5 sm:gap-1 sm:px-2.5 sm:pb-2.5">
        {shopLine ? (
          product.shopSlug ? (
            <Link
              href={`/productos?tienda=${encodeURIComponent(product.shopSlug)}`}
              className="flex min-w-0 items-center gap-1 text-[9px] font-medium text-ink-muted transition hover:text-ink sm:text-[10px]"
            >
              {placeLabel ? <CardMapPinIcon className="size-3 shrink-0 text-ink/55" /> : null}
              <span className="min-w-0 truncate">{shopLine}</span>
            </Link>
          ) : (
            <p className="flex min-w-0 items-center gap-1 text-[9px] font-medium text-ink-muted sm:text-[10px]">
              {placeLabel ? <CardMapPinIcon className="size-3 shrink-0 text-ink/55" /> : null}
              <span className="min-w-0 truncate">{shopLine}</span>
            </p>
          )
        ) : product.categoryName ? (
          <p className="min-w-0 truncate text-[9px] font-medium tracking-wide text-ink-muted sm:text-[10px]">
            {product.categoryName}
          </p>
        ) : null}

        <Link href={`/productos/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-[12px] font-medium leading-[1.25] text-ink transition group-hover:text-ink sm:text-[13px]">
            {product.name}
          </h3>
        </Link>

        {hasOptions ? (
          <div className="flex items-center justify-between gap-1.5 leading-none">
            {sizes.length > 0 ? (
              <p className="min-w-0 truncate text-[9px] font-normal text-ink-muted sm:text-[10px]">
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
                    className="size-2.5 rounded-full ring-1 ring-white/25"
                    style={{ backgroundColor: colorToHex(color) }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-0.5 flex items-center justify-between gap-1.5">
          <ProductPrice
            price={product.price}
            previousPrice={previousPrice}
            size="sm"
            className="flex min-w-0 flex-wrap items-baseline gap-x-1 gap-y-0"
            currentClassName="text-[0.88rem] leading-none sm:text-[0.92rem]"
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

  if (normalized.includes("azul")) return "var(--swatch-blue)";
  if (normalized.includes("rosa")) return "var(--swatch-pink)";
  if (normalized.includes("lila") || normalized.includes("morado")) return "var(--swatch-lilac)";
  if (normalized.includes("blanco")) return "var(--swatch-white)";
  if (normalized.includes("negro")) return "var(--swatch-black)";
  if (normalized.includes("rojo")) return "var(--swatch-red)";
  if (normalized.includes("verde")) return "var(--swatch-green)";
  if (normalized.includes("amarillo")) return "var(--swatch-yellow)";
  if (normalized.includes("beige") || normalized.includes("crema")) return "var(--swatch-beige)";
  if (normalized.includes("gris")) return "var(--swatch-gray)";
  if (normalized.includes("denim")) return "var(--swatch-denim)";
  return "var(--swatch-default)";
}

function CardMapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
