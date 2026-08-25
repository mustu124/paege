import Link from "next/link";

import type { HomepageSlide } from "@/lib/data/homepage-slides";
import { getStorageUrl } from "@/lib/storage";
import { SiteImage } from "@/components/ui/SiteImage";

export function HeroSlide({ slide, priority }: { slide: HomepageSlide; priority: boolean }) {
  const imageUrl = getStorageUrl("homepage-slides", slide.image_path);

  return (
    <div className="relative h-[70vh] min-h-[420px] w-full md:h-[85vh]">
      <SiteImage
        src={imageUrl}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        className="object-cover"
      />

      {(slide.title || slide.subtitle || slide.cta_label) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal-900/50 to-transparent px-6 pb-12 pt-24 md:px-16 md:pb-20">
          {slide.subtitle && (
            <p className="font-sans text-xs uppercase tracking-widest text-cream-50/90">
              {slide.subtitle}
            </p>
          )}
          {slide.title && (
            <h1 className="mt-2 max-w-lg font-serif text-4xl italic text-cream-50 md:text-6xl">
              {slide.title}
            </h1>
          )}
          {slide.cta_label && slide.link_url && (
            <Link
              href={slide.link_url}
              className="mt-6 inline-block border border-cream-50 px-6 py-3 font-sans text-xs uppercase tracking-wider text-cream-50 transition-colors duration-300 ease-editorial hover:bg-cream-50 hover:text-charcoal-900"
            >
              {slide.cta_label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
