import type { ProductSummary } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";

export function RelatedProducts({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border pt-16">
      <h2 className="mb-8 font-serif text-2xl italic text-charcoal-900 md:text-3xl">You May Also Like</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
