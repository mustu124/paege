"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { HomepageSlide } from "@/lib/data/homepage-slides";
import { HeroSlide } from "@/components/home/HeroSlide";

const AUTOPLAY_MS = 6000;

export function HeroCarousel({ slides }: { slides: HomepageSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, paused, slides.length, goTo]);

  if (slides.length === 0) return null;

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0]!.clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  const activeSlide = slides[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="group relative w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`transition-opacity duration-700 ease-editorial ${
            i === index ? "block opacity-100" : "hidden opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <HeroSlide slide={slide} priority={i === 0} />
        </div>
      ))}

      <div className="sr-only" aria-live="polite">
        {activeSlide && `Slide ${index + 1} of ${slides.length}: ${activeSlide.title ?? "PAEGE"}`}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-cream-50/80 p-2 text-charcoal-900 opacity-100 transition-opacity duration-300 md:left-4 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-cream-50/80 p-2 text-charcoal-900 opacity-100 transition-opacity duration-300 md:right-4 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={`h-1 transition-all duration-300 ${
                  i === index ? "w-6 bg-cream-50" : "w-3 bg-cream-50/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
