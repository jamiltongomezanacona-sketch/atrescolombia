import type { Product, Promo } from "@/lib/store-data";
import {
  HOME_HERO_CONTENT,
  HOME_HERO_FALLBACK_SLIDES,
} from "@/components/home/home-visuals";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  primaryHref: string;
  primaryLabel: string;
};

const MAX_SLIDES = 5;

export function buildHeroSlides(promos: Promo[], product?: Product): HeroSlide[] {
  const slides: HeroSlide[] = [];
  const seenImages = new Set<string>();

  const push = (slide: HeroSlide) => {
    if (slides.length >= MAX_SLIDES || seenImages.has(slide.image)) return;
    seenImages.add(slide.image);
    slides.push(slide);
  };

  for (const [index, promo] of promos.entries()) {
    if (!promo.image?.trim()) continue;
    push({
      id: `promo-${index}-${promo.href}`,
      title: promo.title?.trim() || HOME_HERO_CONTENT.title,
      subtitle: promo.subtitle?.trim() || HOME_HERO_CONTENT.subtitle,
      image: promo.image,
      primaryHref: promo.href?.trim() && promo.href !== "#" ? promo.href : HOME_HERO_CONTENT.primaryHref,
      primaryLabel: HOME_HERO_CONTENT.primaryLabel,
    });
  }

  if (product?.image?.trim()) {
    push({
      id: `product-${product.slug}`,
      title: product.name,
      subtitle: product.categoryName || HOME_HERO_CONTENT.subtitle,
      image: product.image,
      primaryHref: `/productos/${product.slug}`,
      primaryLabel: "Ver producto",
    });
  }

  for (const [index, fallback] of HOME_HERO_FALLBACK_SLIDES.entries()) {
    push({
      id: `fallback-${index}`,
      title: fallback.title,
      subtitle: fallback.subtitle,
      image: fallback.image,
      primaryHref: fallback.href,
      primaryLabel: HOME_HERO_CONTENT.primaryLabel,
    });
    if (slides.length >= MAX_SLIDES) break;
  }

  if (!slides.length) {
    push({
      id: "default",
      title: HOME_HERO_CONTENT.title,
      subtitle: HOME_HERO_CONTENT.subtitle,
      image: HOME_HERO_CONTENT.fallbackImage,
      primaryHref: HOME_HERO_CONTENT.primaryHref,
      primaryLabel: HOME_HERO_CONTENT.primaryLabel,
    });
  }

  return slides;
}
