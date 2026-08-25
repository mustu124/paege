import type { Metadata } from "next";
import Link from "next/link";

import { getActiveCategories } from "@/lib/data/categories";
import { getShopFilterOptions, getShopProducts, type ShopSort, type ShopSpecialFilter } from "@/lib/data/shop";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { SortSelect } from "@/components/shop/SortSelect";
import { FilterDrawer } from "@/components/shop/FilterDrawer";
import { ShopFiltersPanel } from "@/components/shop/ShopFiltersPanel";
import { ProductCard } from "@/components/product/ProductCard";
import { PRODUCT_GRID_CLASSES } from "@/components/shop/ProductGrid";

export const metadata: Metadata = { title: "Shop" };

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    filter?: string;
    size?: string;
    colour?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

const VALID_SORTS: ShopSort[] = ["newest", "price-asc", "price-desc", "featured"];
const VALID_SPECIAL_FILTERS: ShopSpecialFilter[] = ["new-arrivals", "bestsellers"];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const sizes = params.size ? params.size.split(",").filter(Boolean) : [];
  const colours = params.colour ? params.colour.split(",").filter(Boolean) : [];
  const minPricePaise = params.minPrice ? Number(params.minPrice) * 100 : undefined;
  const maxPricePaise = params.maxPrice ? Number(params.maxPrice) * 100 : undefined;
  const sort = VALID_SORTS.includes(params.sort as ShopSort) ? (params.sort as ShopSort) : "newest";
  const specialFilter = VALID_SPECIAL_FILTERS.includes(params.filter as ShopSpecialFilter)
    ? (params.filter as ShopSpecialFilter)
    : undefined;

  const [categories, filterOptions, result] = await Promise.all([
    getActiveCategories(),
    getShopFilterOptions(),
    getShopProducts({
      categorySlug: params.category,
      specialFilter,
      sizes,
      colours,
      minPricePaise,
      maxPricePaise,
      sort,
    }),
  ]);

  const specialFilterLabel =
    specialFilter === "new-arrivals" ? "New Arrivals" : specialFilter === "bestsellers" ? "Bestsellers" : null;
  const title = result.categoryName ?? specialFilterLabel ?? "All Products";

  return (
    <Container className="py-10 md:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          ...(title !== "All Products" ? [{ label: title }] : []),
        ]}
      />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl italic text-charcoal-900 md:text-4xl">{title}</h1>
          <p className="mt-1 font-sans text-xs text-charcoal-500">
            {result.total} {result.total === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterDrawer categories={categories} filterOptions={filterOptions} />
          <SortSelect />
        </div>
      </div>

      <div className="mt-10 flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block">
          <ShopFiltersPanel categories={categories} filterOptions={filterOptions} />
        </aside>

        <div className="min-w-0 flex-1">
          {result.products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting or clearing your filters."
              action={
                <Link href="/shop">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              }
            />
          ) : (
            <div className={PRODUCT_GRID_CLASSES}>
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
