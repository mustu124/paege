import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function FeaturedEditorial() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/7]">
          <Image
            src="https://escazdqsbqwhaedygbhn.supabase.co/storage/v1/object/public/homepage-slides/static/featured-editorial-1787622993739.jpg"
            alt="Featured edit"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-charcoal-900/50 to-transparent p-8 md:p-14">
            <p className="font-sans text-xs uppercase tracking-widest text-cream-50/90">The Edit</p>
            <h2 className="mt-2 max-w-md font-serif text-3xl italic text-cream-50 md:text-5xl">
              Pieces worth returning to
            </h2>
            <Link href="/shop" className="mt-6">
              <Button variant="outline" className="border-cream-50 text-cream-50 hover:bg-cream-50 hover:text-charcoal-900">
                Shop the Edit
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
