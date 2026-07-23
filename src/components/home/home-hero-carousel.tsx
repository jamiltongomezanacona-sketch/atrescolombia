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
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(() => new Set([0]));
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
      const target = (index + count) % count;
      setLoadedIndexes((current) => {
        if (current.has(target)) return current;
        const nextIndexes = new Set(current);
        nextIndexes.add(target);
        return nextIndexes;
      });
      setActive(target);
    },
    [count],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    if (!hasMany) return;
    const timer = window.setTimeout(() => {
      setLoadedIndexes((current) => {
        const nextIndexes = new Set(current);
        nextIndexes.add((active + 1) % count);
        return nextIndexes.size === current.size ? current : nextIndexes;
      });
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [active, count, hasMany]);

  useEffect(() => {
    if (!hasMany || paused || reduceMotion) return;
    const timer = window.setInterval(next, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [hasMany, paused, reduceMotion, next]);

  if (!slide) return null;

  return (
    <section
      className="home-hero relative isolate overflow-hidden bg-ink text-white"
      aria-labelledby="home-hero-title"
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
        {slides.map((item, index) => {
          if (!loadedIndexes.has(index) && index !== active) return null;

          return (
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
                className="object-cover object-[center_32%] opacity-85 sm:object-[center_28%] lg:object-[68%_32%] lg:opacity-90"
              />
            </div>
          );
        })}
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
            {slide.title}
          </h1>
          <p className="mt-2 max-w-md text-sm font-normal leading-6 text-white/88 sm:mt-2.5 sm:text-base sm:leading-7">
            {slide.subtitle}
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2 sm:mt-4 sm:gap-2.5">
            <Link
              href={slide.primaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white px-5 text-sm font-medium text-ink shadow-soft transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {slide.primaryLabel}
            </Link>
            <Link
              href={HOME_HERO_CONTENT.secondaryHref}
              className="atres-interactive inline-flex min-h-11 items-center justify-center rounded-[var(--radius-card)] bg-white/10 px-5 text-sm font-medium text-white ring-1 ring-white/35 backdrop-blur-sm transition hover:bg-white/18 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6"
            >
              {HOME_HERO_CONTENT.secondaryLabel}
            </Link>
          </div>
        </div>

        {hasMany ? (
          <div
            className="mt-4 flex items-center justify-center gap-2 pb-1 sm:mt-5"
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
                className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  index === active ? "w-6 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
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
