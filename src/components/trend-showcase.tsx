import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import { ProductPrice } from "@/components/ui/product-price";
import type { CategoryVisualTheme } from "@/lib/category-visuals";
import type { Product } from "@/lib/store-data";
import { cn } from "@/lib/cn";

type TrendShowcaseProps = {
  theme: CategoryVisualTheme;
  products: Product[];
  href?: string;
  compact?: boolean;
  title?: string;
  description?: string;
  showStats?: {
    products: number;
    news: number;
    promos: number;
  };
};

export function TrendShowcase({
  theme,
  products,
  href = "/productos",
  compact = false,
  title,
  description,
  showStats,
}: TrendShowcaseProps) {
  const featured = products.slice(0, 4);
  const headline = title ?? theme.trendTag;
  const body = description ?? theme.headline;

  if (!featured.length && !title) return null;

  return (
    <section className={cn("catalog-container products-catalog-container md:py-4", compact ? "py-1" : "py-3")}>
      <div className={cn("relative overflow-hidden rounded-lg shadow-soft ring-1 ring-white/55", theme.washClass)}>
        <div className="pointer-events-none absolute inset-0">
          <SafeProductImage
            src={theme.heroImage}
            alt=""
            sizes="100vw"
            className="object-cover opacity-[0.16]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black-main/75 via-black-main/35 to-gold/12" />
        <div
          className={cn(
            "relative grid md:p-5",
            compact ? "gap-1.5 p-1.5 md:gap-4 md:p-5" : "gap-4 p-3",
            showStats ? "md:grid-cols-[1fr_0.85fr]" : "md:grid-cols-[0.75fr_1.55fr]",
            compact && "lg:p-6",
          )}
        >
          <Link
            href={href}
            className={cn(
              "flex flex-col justify-center rounded-lg ring-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] md:min-h-[140px]",
              compact ? "min-h-[72px] p-2.5 md:min-h-[100px] md:p-3.5" : "min-h-[128px] p-3.5",
              theme.panelClass,
            )}
          >
            <p className={cn("font-medium", compact ? "text-xs md:text-sm" : "text-sm", theme.accentClass)}>
              {theme.eyebrow}
            </p>
            <h2
              className={cn(
                "font-medium leading-none tracking-tight",
                theme.textClass,
                compact ? "mt-1 text-2xl md:mt-2.5 md:text-3xl lg:text-4xl" : title ? "mt-3 text-2xl md:text-3xl lg:text-4xl" : "mt-3 text-2xl md:text-3xl",
              )}
            >
              {headline}
            </h2>
            <p className={cn("max-w-sm font-normal", compact ? "mt-1 line-clamp-2 text-xs leading-4 md:mt-3 md:text-sm md:leading-6" : "mt-3 text-sm leading-6", theme.mutedTextClass)}>{body}</p>
            <div className={cn("mt-3 flex-wrap gap-2", compact ? "hidden sm:flex" : "flex")}>
              {theme.chips.slice(0, compact ? 3 : 4).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-black-main/35 px-3 py-1 text-[11px] font-medium ring-1 ring-white/10"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Link>

          {showStats ? (
            <div className={cn("grid content-end", compact ? "gap-2" : "gap-3")}>
              <div className={cn("rounded-lg ring-1", compact ? "hidden p-3 sm:block md:p-4" : "p-4", theme.panelClass)}>
                <p className={cn("text-xs font-medium", theme.accentClass)}>Tendencias</p>
                <p className={cn("mt-2 font-medium leading-none", compact ? "text-2xl md:text-3xl" : "text-3xl", theme.textClass)}>{theme.trendTag}</p>
              </div>
              <div className={cn("grid grid-cols-3", compact ? "gap-1 md:gap-2" : "gap-2")}>
                <Stat label="Productos" value={showStats.products} theme={theme} compact={compact} />
                <Stat label="Nuevos" value={showStats.news} theme={theme} compact={compact} />
                <Stat label="Ofertas" value={showStats.promos} theme={theme} compact={compact} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-5">
              {featured.map((product) => (
                <Link
                  key={`${theme.trendTag}-${product.slug}`}
                  href={`/productos/${product.slug}`}
                  className="group relative overflow-hidden rounded-lg border border-white/10 bg-black-main/50 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-gold/30 hover:shadow-lift"
                >
                  <div className="relative aspect-[3/4] bg-surface-muted">
                    <SafeProductImage
                      src={product.image}
                      alt={product.name}
                      sizes="(max-width: 768px) 46vw, 190px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-x-2 bottom-2 rounded-full bg-black-main/82 px-2 py-1 text-center shadow-sm ring-1 ring-white/10 backdrop-blur-sm">
                    <ProductPrice price={product.price} className="text-center [&>p]:w-full" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  theme,
  compact = false,
}: {
  label: string;
  value: number;
  theme: CategoryVisualTheme;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-lg text-center ring-1", compact ? "p-1.5 md:p-3" : "p-3", theme.panelClass)}>
      <p className={cn("font-medium", compact ? "text-lg md:text-2xl" : "text-2xl", theme.textClass)}>{value}</p>
      <p className={cn("mt-0.5 text-[9px] font-normal md:mt-1 md:text-[10px]", theme.mutedTextClass)}>{label}</p>
    </div>
  );
}
