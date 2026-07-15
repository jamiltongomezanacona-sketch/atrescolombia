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
    <section className="mx-auto max-w-[1350px] px-3 py-4 sm:px-4 md:py-5">
      <div className={`relative overflow-hidden rounded-lg ${theme.washClass} shadow-[0_28px_90px_rgba(16,24,40,0.14)] ring-1 ring-white/55`}>
        <SafeProductImage
          src={theme.heroImage}
          alt=""
          sizes="100vw"
          className="object-cover opacity-[0.18] blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/[0.16] via-white/[0.12] to-white/[0.42]" />
        <div className="relative grid gap-5 p-4 md:grid-cols-[0.75fr_1.55fr] md:p-7 lg:p-8">
          <Link href={href} className={`flex min-h-[210px] flex-col justify-center rounded-lg p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl ring-1 ${theme.panelClass}`}>
            <p className={`text-sm font-black uppercase tracking-[0.18em] ${theme.accentClass}`}>Trends</p>
            <h2 className={`mt-4 text-4xl font-black leading-none tracking-tight md:text-5xl ${theme.textClass}`}>
              {theme.trendTag}
            </h2>
            <p className={`mt-4 max-w-sm text-sm font-bold leading-6 ${theme.mutedTextClass}`}>
              {theme.headline}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {theme.chips.slice(0, compact ? 3 : 4).map((chip) => (
                <span key={chip} className="rounded-full bg-white/25 px-3 py-1 text-[11px] font-black uppercase ring-1 ring-current/10 backdrop-blur">
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
                className="group relative overflow-hidden rounded-lg border-[5px] border-white/[0.62] bg-white/82 shadow-[0_18px_40px_rgba(15,23,42,0.13)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
              >
                <div className="relative aspect-[3/4] bg-stone-100">
                  <SafeProductImage
                    src={product.image}
                    alt={product.name}
                    sizes="(max-width: 768px) 46vw, 190px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-2 bottom-2 rounded-full bg-white/88 px-2 py-1 text-center text-lg font-black text-[#ff4d00] shadow-sm backdrop-blur-xl">
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
