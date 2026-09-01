import type { Metadata } from "next";
import Image from "next/image";

import { getSiteImages } from "@/lib/data/site-images";
import { getStorageUrl } from "@/lib/storage";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const siteImages = await getSiteImages();
  const aboutImage = siteImages.about_page;

  return (
    <Container className="py-16 md:py-24">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
            <Image
              src={getStorageUrl("homepage-slides", aboutImage?.storage_path)}
              alt={aboutImage?.alt_text ?? "Detail of fabric and stitching, representing PAEGE's considered approach to craft"}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <h1 className="font-serif text-4xl italic text-charcoal-900 md:text-5xl">About Us</h1>

          <div className="mt-10 flex flex-col gap-6 font-sans text-base leading-relaxed text-charcoal-700 md:text-lg">
            <p>Fashion is more than just clothes.</p>

            <p>
              It&apos;s memory.
              <br />
              It&apos;s identity.
              <br />
              It&apos;s the moments that stay with you.
            </p>

            <p>
              The outfit you wore on a day that changed everything.
              <br />
              The piece you&apos;ll never throw away because it meant something.
            </p>

            <p>
              At PAEGE, we believe in fewer pieces, created with intention — limited, thoughtful, and made
              to be kept.
            </p>

            <p>We&apos;re not here to make more just for the sake of more.</p>

            <p>
              We&apos;re here to create pieces that feel personal. Pieces you reach for, live in, and
              eventually associate with a moment, a feeling, a version of yourself.
            </p>

            <p>Because when something is made with purpose, it feels different.</p>

            <p>And when you wear it, it becomes part of your story.</p>
          </div>

          <p className="mt-10 font-serif text-2xl italic text-burgundy">PAEGE — A Part of You.</p>
        </div>
      </div>
    </Container>
  );
}
