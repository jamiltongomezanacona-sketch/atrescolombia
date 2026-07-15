import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import type { CategoryVisualTheme } from "@/lib/category-visuals";
import { formatCOP, type Product } from "@/lib/store-data";

type TrendShowcaseProps = {
  theme: CategoryVisualTheme;
  products: Product[];
  href?: string;
  compact?: boolean;
};

export function TrendShowcase({ theme, products, href = "/productos", compact = false }: TrendShowcaseProps) {
  const featured = products.slice(0, 4);

  if (!featured.length) return null;

  return (
    <section className="mx-auto max-w-[1350px] px-3 py-3 sm:px-4">
      <div className={`relative overflow-hidden rounded-[6px] ${theme.washClass} shadow-[0_22px_70px_rgba(16,24,40,0.12)]`}>
        <SafeProductImage
          src={theme.heroImage}
          alt=""
          sizes="100vw"
          className="object-cover opacity-20 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-white/10 to-white/[0.35]" />
        <div className="relative grid gap-5 p-4 md:grid-cols-[0.75fr_1.55fr] md:p-7">
          <Link href={href} className={`flex min-h-[220px] flex-col justify-center rounded-[6px] p-5 backdrop-blur-md ring-1 ${theme.panelClass}`}>
            <p className={`text-sm font-black uppercase tracking-[0.18em] ${theme.accentClass}`}>Trends</p>
            <h2 className={`mt-4 text-4xl font-black leading-none tracking-tight md:text-5xl ${theme.textClass}`}>
              {theme.trendTag}
            </h2>
            <p className={`mt-4 max-w-sm text-sm font-bold leading-6 ${theme.mutedTextClass}`}>
              {theme.headline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {theme.chips.slice(0, compact ? 3 : 4).map((chip) => (
                <span key={chip} className="rounded-full bg-white/25 px-3 py-1 text-[11px] font-black uppercase ring-1 ring-current/10">
                  {chip}
                </span>
              ))}
            </div>
          </Link>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-5">
            {featured.map((product) => (
              <Link
                key={`${theme.trendTag}-${product.slug}`}
                href={`/productos/${product.slug}`}
                className="group relative overflow-hidden rounded-[6px] border-[5px] border-white/[0.76] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.13)] transition duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[3/4] bg-stone-100">
                  <SafeProductImage
                    src={product.image}
                    alt={product.name}
                    sizes="(max-width: 768px) 46vw, 190px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-2 bottom-2 rounded-full bg-white/94 px-2 py-1 text-center text-lg font-black text-[#ff4d00] shadow-sm backdrop-blur">
                  {formatCOP(product.price)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
