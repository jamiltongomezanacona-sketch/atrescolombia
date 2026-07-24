"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HeroSlide } from "@/components/home/home-hero-slides";
import { HOME_HERO_CONTENT } from "@/components/home/home-visuals";
import { SafeProductImage } from "@/components/safe-product-image";

const AUTO_MS = 5500;

type HomeHeroCarouselProps = {
  slides: HeroSlide[];
};

export function HomeHeroCarousel({ slides }: HomeHeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = slides.length;
  const hasMany = count > 1;
  const slide = slides[active] ?? slides[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (!count) return;
      setActive((index + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    if (!hasMany || paused || reduceMotion) return;
    const timer = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [hasMany, paused, reduceMotion, next]);

  if (!slide) return null;

  return (
    <section
      className="home-hero relative isolate overflow-hidden bg-black-main text-white"
      aria-labelledby="home-hero-brand"
      aria-roledescription={hasMany ? "carrusel" : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              index === active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={index !== active}
          >
            <SafeProductImage
              src={item.image}
              alt=""
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-[center_28%] opacity-80 sm:object-[center_24%] lg:object-[72%_30%] lg:opacity-88"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="premium-fade-gold absolute inset-0 opacity-70" />
      </div>

      <div className="catalog-container relative flex min-h-[340px] max-h-[520px] flex-col justify-end pb-5 pt-10 sm:min-h-[380px] sm:pb-7 sm:pt-12 lg:min-h-[440px] lg:max-h-[560px] lg:pb-8">
        <div className="max-w-xl lg:max-w-2xl">
          <p
            id="home-hero-brand"
            className="font-semibold tracking-[0.22em] text-gold-light [text-shadow:0_2px_20px_rgba(0,0,0,0.55)] text-[1.35rem] sm:text-[1.75rem] lg:text-[2.15rem]"
          >
            ATRES
          </p>
          <p className="mt-1 text-[11px] font-medium tracking-[0.28em] text-white/75 sm:text-xs">
            COLOMBIA · MARKETPLACE
          </p>
          <h1 className="mt-3 text-[1.55rem] font-medium leading-[1.05] tracking-tight !text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)] sm:mt-3.5 sm:text-[2.15rem] lg:text-[2.75rem]">
            {slide.title}
          </h1>
          <p className="mt-2 max-w-md text-sm font-normal leading-6 text-white/86 sm:mt-2.5 sm:text-base sm:leading-7">
            {slide.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5">
            <Link
              href={slide.primaryHref}
              className="theme-primary-button atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {slide.primaryLabel}
            </Link>
            <Link
              href={HOME_HERO_CONTENT.secondaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white/12 px-5 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {HOME_HERO_CONTENT.secondaryLabel}
            </Link>
          </div>
        </div>

        {hasMany ? (
          <div
            className="mt-5 flex items-center gap-2 pb-0.5 sm:mt-6"
            role="tablist"
            aria-label="Slides del banner principal"
          >
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Slide ${index + 1}: ${item.title}`}
                className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  index === active ? "w-8 bg-gold" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        ) : null}
      </div>

      {hasMany ? (
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {slide.title}. Slide {active + 1} de {count}.
        </p>
      ) : null}
    </section>
  );
}
