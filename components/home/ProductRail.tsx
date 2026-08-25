import Link from "next/link";

import type { ProductSummary } from "@/lib/data/products";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/product/ProductCard";

interface ProductRailProps {
  title: string;
  viewAllHref: string;
  products: ProductSummary[];
}

export function ProductRail({ title, viewAllHref, products }: ProductRailProps) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">{title}</h2>
          <Link
            href={viewAllHref}
            className="link-underline hidden font-sans text-xs uppercase tracking-wider text-charcoal-700 md:block"
          >
            View All
          </Link>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="Coming soon"
            description="This edit is being curated. Check back shortly."
          />
        ) : (
          <div className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:px-0">
            {products.map((product) => (
              <div key={product.id} className="w-[65vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        <Link
          href={viewAllHref}
          className="link-underline mt-8 block text-center font-sans text-xs uppercase tracking-wider text-charcoal-700 md:hidden"
        >
          View All
        </Link>
      </Container>
    </section>
  );
}
