import type { Metadata } from "next";
import Image from "next/image";
import { Paperclip } from "lucide-react";

import { getSiteImages } from "@/lib/data/site-images";
import { getStorageUrl } from "@/lib/storage";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "About Us" };

// Torn-edge "note card" — a jagged top edge via clip-path, standing
// in front of a duotone photo, PAEGE's real facts as terse pinned
// notes rather than PAEGE's usual flowing copy (that copy still runs
// in full below — this is a visual opener, not a replacement).
const TORN_EDGE = {
  clipPath:
    "polygon(0% 5%, 4% 1%, 8% 4%, 12% 0%, 16% 4%, 20% 1%, 24% 5%, 28% 0%, 32% 4%, 36% 1%, 40% 5%, 44% 0%, 48% 4%, 52% 1%, 56% 5%, 60% 0%, 64% 4%, 68% 1%, 72% 5%, 76% 0%, 80% 4%, 84% 1%, 88% 5%, 92% 0%, 96% 4%, 100% 1%, 100% 100%, 0% 100%)",
};

const NOTES = ["MADE WITH INTENTION.", "LIMITED BY DESIGN.", "FEWER PIECES, MORE THOUGHT.", "EVERY PIECE BECOMES PART OF YOUR STORY."];

export default async function AboutPage() {
  const siteImages = await getSiteImages();
  const aboutImage = siteImages.about_page;

  return (
    <Container className="py-16 md:py-24">
      <div className="relative mx-auto flex max-w-sm flex-col items-center md:max-w-none md:flex-row md:items-end md:justify-center md:gap-4">
        <div className="relative aspect-[4/5] w-56 shrink-0 overflow-hidden grayscale md:w-72">
          <Image
            src={getStorageUrl("homepage-slides", aboutImage?.storage_path)}
            alt={aboutImage?.alt_text ?? "Detail of fabric and stitching, representing PAEGE's considered approach to craft"}
            fill
            sizes="(min-width: 768px) 30vw, 60vw"
            className="object-cover"
          />
        </div>

        <div
          style={TORN_EDGE}
          className="relative -mt-16 w-64 shrink-0 border border-border/60 bg-cream-50 px-6 pb-8 pt-6 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.25)] md:-ml-10 md:mt-0 md:w-72 md:rotate-[-2deg]"
        >
          <Paperclip size={20} strokeWidth={1.25} className="absolute -top-3 left-6 -rotate-45 text-charcoal-500" />
          <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-charcoal-500">About Paege</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NOTES.map((note) => (
              <li key={note} className="font-sans text-xs uppercase tracking-wide text-charcoal-900">
                {note}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-serif text-sm italic text-charcoal-500">— and still building.</p>
        </div>
      </div>
      <p className="mt-6 text-center font-serif text-sm italic text-charcoal-500 md:mt-4">stay tuned for more.</p>

      <div className="mx-auto mt-16 max-w-xl md:mt-24">
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
    </Container>
  );
}
