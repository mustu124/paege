"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ProductImage } from "@/lib/data/product-detail";
import { getStorageUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { SiteImage } from "@/components/ui/SiteImage";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [selected, setSelected] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  // onTouchEnd needs the latest drag distance the instant the touch
  // lifts — reading it from `dragOffsetPx` state would race a fast
  // flick against React's render commit (the touchmove that set it
  // may not have re-rendered yet), so it's tracked in a ref alongside
  // the state used purely for the visual transform.
  const dragOffsetRef = useRef(0);

  // Always show at least one frame, even with zero real images, so
  // the layout never collapses — falls back to the shared placeholder.
  const frames = images.length > 0 ? images : [{ storagePath: "", altText: null, isPrimary: true }];
  const activeAlt = frames[selected]?.altText || productName;
  const canGoPrev = selected > 0;
  const canGoNext = selected < frames.length - 1;

  function goTo(index: number) {
    setSelected(Math.min(Math.max(index, 0), frames.length - 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    setIsDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.touches[0]!.clientX - touchStartX.current;
    // Rubber-band resistance past the first/last frame, so it's
    // obvious there's nothing further that way instead of feeling
    // like the gesture just didn't register.
    const atStart = selected === 0 && delta > 0;
    const atEnd = selected === frames.length - 1 && delta < 0;
    const offset = atStart || atEnd ? delta * 0.3 : delta;
    dragOffsetRef.current = offset;
    setDragOffsetPx(offset);
  }

  function onTouchEnd() {
    if (touchStartX.current === null) return;
    const width = trackRef.current?.offsetWidth || 1;
    // A short, forgiving distance (~15% of the frame width) rather
    // than a large fixed pixel threshold — a quick, small flick
    // should commit to the next image, not just a slow deliberate
    // drag most of the way across the screen.
    if (Math.abs(dragOffsetRef.current) > width * 0.15) {
      goTo(selected + (dragOffsetRef.current < 0 ? 1 : -1));
    }
    touchStartX.current = null;
    dragOffsetRef.current = 0;
    setDragOffsetPx(0);
    setIsDragging(false);
  }

  return (
    <div>
      {/* Mobile: swipeable carousel + dot indicators */}
      <div className="lg:hidden">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
          <div
            ref={trackRef}
            className="flex h-full touch-pan-y select-none"
            style={{
              transform: `translateX(calc(${-selected * 100}% + ${dragOffsetPx}px))`,
              transition: isDragging ? "none" : "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {frames.map((frame, i) => (
              <div key={i} className="relative h-full w-full shrink-0 grow-0 basis-full">
                <SiteImage
                  src={getStorageUrl("product-images", frame.storagePath)}
                  alt={frame.altText || productName}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  draggable={false}
                  className="pointer-events-none object-cover"
                />
              </div>
            ))}
          </div>

          {canGoPrev && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(selected - 1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-cream/80 text-charcoal-900"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
          )}
          {canGoNext && (
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(selected + 1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-cream/80 text-charcoal-900"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>
        {frames.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {frames.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`View image ${i + 1}`}
                aria-current={i === selected}
                onClick={() => goTo(i)}
                className={cn("h-1.5 w-1.5 rounded-full", i === selected ? "bg-charcoal-900" : "bg-charcoal-900/25")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: vertical thumbnail rail + large main image */}
      <div className="hidden gap-4 lg:flex">
        {frames.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {frames.map((frame, i) => (
              <button
                key={i}
                type="button"
                aria-label={`View image ${i + 1}`}
                aria-current={i === selected}
                onClick={() => goTo(i)}
                className={cn(
                  "relative aspect-[4/5] w-full overflow-hidden border bg-cream-100 transition-colors",
                  i === selected ? "border-charcoal-900" : "border-border hover:border-charcoal-500",
                )}
              >
                <SiteImage
                  src={getStorageUrl("product-images", frame.storagePath)}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-cream-100">
          <SiteImage
            src={getStorageUrl("product-images", frames[selected]?.storagePath)}
            alt={activeAlt}
            fill
            sizes="45vw"
            priority
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
