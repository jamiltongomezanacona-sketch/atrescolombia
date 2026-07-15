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
    <section className="store-container py-4 md:py-5">
      <div className={cn("relative overflow-hidden rounded-lg shadow-soft ring-1 ring-white/55", theme.washClass)}>
        <div className="pointer-events-none absolute inset-0">
          <SafeProductImage
            src={theme.heroImage}
            alt=""
            sizes="100vw"
            className="object-cover opacity-[0.16]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-white/10 to-white/40" />
        <div
          className={cn(
            "relative grid gap-5 p-4 md:p-7",
            showStats ? "md:grid-cols-[1fr_0.85fr]" : "md:grid-cols-[0.75fr_1.55fr]",
            compact && "lg:p-6",
          )}
        >
          <Link
            href={href}
            className={cn(
              "flex min-h-[200px] flex-col justify-center rounded-lg p-5 ring-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]",
              theme.panelClass,
            )}
          >
            <p className={cn("text-sm font-black uppercase tracking-[0.18em]", theme.accentClass)}>
              {theme.eyebrow}
            </p>
            <h2
              className={cn(
                "mt-4 font-black leading-none tracking-tight",
                theme.textClass,
                title ? "text-4xl md:text-5xl lg:text-6xl" : "text-4xl md:text-5xl",
              )}
            >
              {headline}
            </h2>
            <p className={cn("mt-4 max-w-sm text-sm font-bold leading-6", theme.mutedTextClass)}>{body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {theme.chips.slice(0, compact ? 3 : 4).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-white/25 px-3 py-1 text-[11px] font-black uppercase ring-1 ring-current/10"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Link>

          {showStats ? (
            <div className="grid content-end gap-3">
              <div className={cn("rounded-lg p-4 ring-1", theme.panelClass)}>
                <p className={cn("text-xs font-black uppercase tracking-[0.18em]", theme.accentClass)}>Trends</p>
                <p className={cn("mt-2 text-3xl font-black leading-none", theme.textClass)}>{theme.trendTag}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Productos" value={showStats.products} theme={theme} />
                <Stat label="Nuevos" value={showStats.news} theme={theme} />
                <Stat label="Ofertas" value={showStats.promos} theme={theme} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-5">
              {featured.map((product) => (
                <Link
                  key={`${theme.trendTag}-${product.slug}`}
                  href={`/productos/${product.slug}`}
                  className="group relative overflow-hidden rounded-lg border-[5px] border-white/60 bg-white/85 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[3/4] bg-stone-100">
                    <SafeProductImage
                      src={product.image}
                      alt={product.name}
                      sizes="(max-width: 768px) 46vw, 190px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-x-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-center shadow-sm">
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
}: {
  label: string;
  value: number;
  theme: CategoryVisualTheme;
}) {
  return (
    <div className={cn("rounded-lg p-3 text-center ring-1", theme.panelClass)}>
      <p className={cn("text-2xl font-black", theme.textClass)}>{value}</p>
      <p className={cn("mt-1 text-[10px] font-black uppercase", theme.mutedTextClass)}>{label}</p>
    </div>
  );
}
