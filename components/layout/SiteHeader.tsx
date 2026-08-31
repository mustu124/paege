import Link from "next/link";
import { Heart, Search, ShoppingBag } from "lucide-react";

import { Container } from "@/components/ui/Container";
import { CartCountBadge } from "@/components/layout/CartCountBadge";
import { WishlistCountBadge } from "@/components/layout/WishlistCountBadge";
import { EditsDropdown } from "@/components/layout/EditsDropdown";
import { MobileNav } from "@/components/layout/MobileNav";

// Nav per the client's header spec: Home, The New Edit, The Edits
// (dropdown — Find Yours/Dresses/Tops/Bottoms), About Paege. Left-
// aligned logo (not centered) — a dedicated nav track next to it
// avoids the earlier centered-logo/nav collision entirely, by
// construction, instead of needing a breakpoint to paper over it.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-cream/95 backdrop-blur-sm">
      <div className="bg-burgundy py-2 text-center">
        <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-cream-50">A Part of You.</p>
      </div>

      <Container className="flex h-16 items-center justify-between md:h-20">
        <div className="flex min-w-0 items-center gap-8">
          <MobileNav />
          <Link href="/" className="shrink-0 font-serif text-2xl italic tracking-wide text-burgundy md:text-3xl">
            PAEGE
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
            <Link
              href="/"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              Home
            </Link>
            <Link
              href="/shop?filter=new-arrivals"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              The New Edit
            </Link>
            <EditsDropdown />
            <Link
              href="/about"
              className="link-underline whitespace-nowrap font-sans text-xs uppercase tracking-wider text-charcoal-900"
            >
              About Paege
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-4 text-charcoal-900 md:gap-5">
          <Link href="/shop" aria-label="Search" className="hidden lg:block">
            <Search size={19} strokeWidth={1.5} />
          </Link>
          <Link href="/wishlist" aria-label="Almost Yours (bookmarked items)" className="flex items-center">
            <Heart size={19} strokeWidth={1.5} />
            <WishlistCountBadge />
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
