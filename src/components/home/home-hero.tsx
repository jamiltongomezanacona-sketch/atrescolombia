import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import type { Product, Promo } from "@/lib/store-data";
import { HOME_HERO_CONTENT } from "@/components/home/home-visuals";

type HomeHeroProps = {
  product?: Product;
  promo?: Promo;
};

export function HomeHero({ product, promo }: HomeHeroProps) {
  const image = promo?.image ?? product?.image ?? HOME_HERO_CONTENT.fallbackImage;
  const title = promo?.title?.trim() || HOME_HERO_CONTENT.title;
  const subtitle = promo?.subtitle?.trim() || HOME_HERO_CONTENT.subtitle;
  const primaryHref = promo?.href && promo.href !== "#" ? promo.href : HOME_HERO_CONTENT.primaryHref;

  return (
    <section
      className="home-hero relative isolate overflow-hidden bg-ink text-white"
      aria-labelledby="home-hero-title"
    >
      <div className="absolute inset-0">
        <SafeProductImage
          src={image}
          alt={title}
          priority
          sizes="100vw"
          className="object-cover object-[center_32%] opacity-85 sm:object-[center_28%] lg:object-[68%_32%] lg:opacity-90"
        />
        <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(8,8,8,0.92)_0%,rgba(8,8,8,0.58)_42%,rgba(8,8,8,0.18)_68%,rgba(8,8,8,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(255,77,0,0.22),transparent_42%)]" />
      </div>

      <div className="catalog-container relative flex min-h-[300px] max-h-[440px] flex-col justify-end pb-4 pt-8 sm:min-h-[340px] sm:pb-6 sm:pt-10 lg:min-h-[400px] lg:max-h-[480px] lg:pb-7">
        <div className="max-w-xl lg:max-w-2xl">
          <p className="inline-flex items-center rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] text-white/90 ring-1 ring-white/20 backdrop-blur-sm sm:text-[11px]">
            {HOME_HERO_CONTENT.eyebrow.toUpperCase()}
          </p>
          <h1
            id="home-hero-title"
            className="mt-3 text-[1.85rem] font-medium leading-[0.98] tracking-tight !text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.45)] sm:text-[2.65rem] lg:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-2 max-w-md text-sm font-normal leading-6 text-white/88 sm:mt-2.5 sm:text-base sm:leading-7">
            {subtitle}
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2 sm:mt-4 sm:gap-2.5">
            <Link
              href={primaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {HOME_HERO_CONTENT.primaryLabel}
            </Link>
            <Link
              href={HOME_HERO_CONTENT.secondaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white/10 px-5 text-sm font-medium text-white ring-1 ring-white/35 backdrop-blur-sm transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {HOME_HERO_CONTENT.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
