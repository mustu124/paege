import { Container } from "@/components/ui/Container";

// A pure brand moment — no products, no CTA, just the wordmark and
// the tagline, sitting on its own between the curated rails and the
// closing statement.
export function PaegeStatement() {
  return (
    <section className="py-20 md:py-32">
      <Container className="text-center">
        <p className="font-serif text-5xl italic text-burgundy md:text-7xl">PAEGE</p>
        <p className="mt-4 font-sans text-sm uppercase tracking-widest text-charcoal-500">A Part of You.</p>
      </Container>
    </section>
  );
}
