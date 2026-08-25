import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";

import { getActiveCategories } from "@/lib/data/categories";
import { Container } from "@/components/ui/Container";
import { CartCountBadge } from "@/components/layout/CartCountBadge";
import { MobileNav } from "@/components/layout/MobileNav";

export async function SiteHeader() {
  const categories = await getActiveCategories();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur-sm">
      <Container className="relative flex h-16 items-center justify-between md:h-20">
        {/* Left: nav — the full text nav needs real room to avoid
            colliding with the centered logo (six links don't fit
            between the left edge and center until ~xl), so the
            hamburger (which already contains every link here, plus
            Bestsellers) covers the whole md/lg range instead of just
            mobile widths. MobileNav manages its own xl:hidden. */}
        <div className="flex min-w-0 items-center">
          <MobileNav categories={categories} />
          <nav aria-label="Primary" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
            <Link
              href="/shop"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/shop?filter=new-arrivals"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              New Arrivals
            </Link>
          </nav>
        </div>

        {/* Center: logo — absolutely centered on the viewport so it
            never has to fight the nav/icons for a share of a grid
            track (the two sides are rarely equal-width in content). */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl italic tracking-wide text-burgundy md:text-3xl"
        >
          PAEGE
        </Link>

        {/* Right: actions */}
        <div className="flex shrink-0 items-center justify-end gap-4 text-charcoal-900 md:gap-5">
          <Link href="/shop" aria-label="Search" className="hidden xl:block">
            <Search size={19} strokeWidth={1.5} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="flex items-center">
            <ShoppingBag size={19} strokeWidth={1.5} />
            <CartCountBadge />
          </Link>
        </div>
      </Container>
    </header>
  );
}
