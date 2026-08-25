import Link from "next/link";

import type { ProductSummary } from "@/lib/data/products";
import { getStorageUrl } from "@/lib/storage";
import { formatPaise } from "@/lib/utils";
import { SiteImage } from "@/components/ui/SiteImage";

// One badge, max — priority: sold out > new > bestseller. Showing
// several at once reads as noisy rather than informative.
function ProductBadge({ product }: { product: ProductSummary }) {
  if (product.is_sold_out) {
    return (
      <span className="absolute left-3 top-3 bg-charcoal-900/90 px-2.5 py-1 font-sans text-[10px] uppercase tracking-widest text-cream-50">
        Sold Out
      </span>
    );
  }
  if (product.is_new_arrival) {
    return (
      <span className="absolute left-3 top-3 bg-cream/90 px-2.5 py-1 font-sans text-[10px] uppercase tracking-widest text-charcoal-900">
        New
      </span>
    );
  }
  if (product.is_bestseller) {
    return (
      <span className="absolute left-3 top-3 bg-cream/90 px-2.5 py-1 font-sans text-[10px] uppercase tracking-widest text-charcoal-900">
        Bestseller
      </span>
    );
  }
  return null;
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const imageUrl = getStorageUrl("product-images", product.primary_image_path);
  const metaLine = [product.category_name, product.product_type].filter(Boolean).join(" · ");

  return (
    <Link href={`/product/${product.slug}`} className="group block w-full shrink-0">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
        <SiteImage
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 80vw"
          className={`object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.03] ${
            product.is_sold_out ? "opacity-60" : ""
          }`}
        />
        <ProductBadge product={product} />
      </div>
      <div className="mt-3 flex flex-col gap-0.5">
        {metaLine && (
          <p className="font-sans text-[11px] uppercase tracking-wider text-charcoal-500">{metaLine}</p>
        )}
        <p className="font-sans text-sm text-charcoal-900">{product.name}</p>
        <p className="font-sans text-sm text-charcoal-700">{formatPaise(product.price_paise)}</p>
      </div>
    </Link>
  );
}
