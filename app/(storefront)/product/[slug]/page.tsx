import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductBySlug, getRelatedProducts } from "@/lib/data/product-detail";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Disclosure } from "@/components/ui/Disclosure";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { formatPaise } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.short_description ?? product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category_id, 4);

  const metaLine = [product.colour, product.fabric].filter(Boolean).join(" · ");
  const washCareLines = product.wash_care_instructions?.split("\n").filter(Boolean) ?? [];

  return (
    <Container className="py-10 md:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(product.categoryName
            ? [{ label: product.categoryName, href: `/shop?category=${product.categorySlug}` }]
            : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="max-w-xl">
          {(product.categoryName || product.product_type) && (
            <p className="font-sans text-xs uppercase tracking-widest text-charcoal-500">
              {[product.categoryName, product.product_type].filter(Boolean).join(" · ")}
            </p>
          )}
          <h1 className="mt-2 font-serif text-3xl italic text-charcoal-900 md:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-sans text-xl text-charcoal-900">{formatPaise(product.price_paise)}</p>
            {product.compare_at_price_paise && product.compare_at_price_paise > product.price_paise && (
              <p className="font-sans text-sm text-charcoal-500 line-through">
                {formatPaise(product.compare_at_price_paise)}
              </p>
            )}
          </div>

          {metaLine && <p className="mt-3 font-sans text-sm text-charcoal-700">{metaLine}</p>}

          {product.description && (
            <p className="mt-5 font-sans text-sm leading-relaxed text-charcoal-700">{product.description}</p>
          )}

          <div className="mt-8">
            <PurchasePanel
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              unitPricePaise={product.price_paise}
              primaryImagePath={product.images[0]?.storagePath ?? null}
              variants={product.variants}
              isSoldOut={product.isSoldOut}
            />
          </div>

          <div className="mt-10">
            {washCareLines.length > 0 && (
              <Disclosure title="Wash Care">
                <ul className="flex flex-col gap-1.5">
                  {washCareLines.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span aria-hidden="true">–</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </Disclosure>
            )}
            <Disclosure title="Shipping & Returns">
              <p>
                Orders are carefully packed and dispatched after processing. You&apos;ll
                receive tracking details by email once your order ships. See your order
                confirmation for return and exchange details.
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
    </Container>
  );
}
