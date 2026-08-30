import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { CartCountBadge } from "@/components/layout/CartCountBadge";
import { MobileNav } from "@/components/layout/MobileNav";

// Nav copy per the brand refresh: Find Yours (shop all), The Edit
// (category browsing, collapsed to one link — /shop itself still
// filters by category, dynamically, nothing hard-coded), The New
// Edit (new arrivals), The Paege Favourites (bestsellers), About
// Paege. No longer needs categories fetched here at all — the
// individual category links this used to render are gone in favor
// of the single "The Edit" link.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur-sm">
      <Container className="relative flex h-16 items-center justify-between md:h-20">
        {/* Left: nav — the full text nav needs real room to avoid
            colliding with the centered logo, so the hamburger (which
            already contains every link here) covers the whole md/lg
            range instead of just mobile widths. MobileNav manages its
            own xl:hidden. */}
        <div className="flex min-w-0 items-center">
          <MobileNav />
          <nav aria-label="Primary" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
            <Link
              href="/shop"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              Find Yours
            </Link>
            <Link
              href="/shop"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              The Edit
            </Link>
            <Link
              href="/shop?filter=new-arrivals"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              The New Edit
            </Link>
            <Link
              href="/shop?filter=bestsellers"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              The Paege Favourites
            </Link>
            <Link
              href="/about"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              About Paege
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
