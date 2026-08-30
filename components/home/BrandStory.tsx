import Image from "next/image";

import { Container } from "@/components/ui/Container";

export function BrandStory() {
  return (
    <section className="py-16 md:py-24">
      <Container className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] w-full overflow-hidden md:order-2">
          <Image
            src="https://escazdqsbqwhaedygbhn.supabase.co/storage/v1/object/public/homepage-slides/static/brand-story-1787622994725.jpg"
            alt="Detail of fabric and stitching, representing PAEGE's considered approach to craft"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="md:order-1">
          <p className="font-sans text-xs uppercase tracking-widest text-charcoal-500">Our Approach</p>
          <h2 className="mt-3 font-serif text-3xl italic text-charcoal-900 md:text-4xl">
            Less, but better.
          </h2>
          <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-charcoal-700">
            We make fewer pieces, with more thought behind them.
          </p>
        </div>
      </Container>
    </section>
  );
}
