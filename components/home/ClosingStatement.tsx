import { Container } from "@/components/ui/Container";

// The full-width statement right before the footer — deliberately
// text-only and dark, mirroring the tone shift of FeaturedEditorial's
// band but standing entirely on its own as the site's closing note.
export function ClosingStatement() {
  return (
    <section className="bg-charcoal-900 py-20 text-center md:py-28">
      <Container>
        <h2 className="mx-auto max-w-2xl font-serif text-3xl italic leading-tight text-cream-50 md:text-5xl">
          The pieces you remember are never just clothes.
        </h2>

        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-1 font-sans text-sm text-cream-50/80">
          <p>They&apos;re the night.</p>
          <p>The place.</p>
          <p>The person you were.</p>
          <p>The version of you that existed then.</p>
        </div>

        <p className="mt-8 font-sans text-sm text-cream-50/90">Choose pieces that become part of it.</p>

        <p className="mt-10 font-sans text-xs uppercase tracking-widest text-cream-50/70">PAEGE — Part of You.</p>
      </Container>
    </section>
  );
}
