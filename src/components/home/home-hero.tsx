import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { buildHeroSlides } from "@/components/home/home-hero-slides";
import type { Product, Promo } from "@/lib/store-data";

type HomeHeroProps = {
  promos: Promo[];
  product?: Product;
};

export function HomeHero({ promos, product }: HomeHeroProps) {
  const slides = buildHeroSlides(promos, product);
  return <HomeHeroCarousel slides={slides} />;
}
