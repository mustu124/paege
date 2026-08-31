import Link from "next/link";

import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <Container className="grid grid-cols-2 gap-10 py-16 md:grid-cols-3">
        <div className="col-span-2 md:col-span-1">
          <p className="font-serif text-2xl italic text-burgundy">PAEGE</p>
          <p className="mt-4 max-w-[220px] font-sans text-sm leading-relaxed text-charcoal-500">
            A Part of You.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Shop</p>
          <Link href="/shop" className="font-sans text-sm text-charcoal-500 hover:text-charcoal-900">
            All Products
          </Link>
          <Link
            href="/shop?filter=new-arrivals"
            className="font-sans text-sm text-charcoal-500 hover:text-charcoal-900"
          >
            New Arrivals
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Support</p>
          <Link href="/about" className="font-sans text-sm text-charcoal-500 hover:text-charcoal-900">
            About Paege
          </Link>
          <Link href="/shipping-returns" className="font-sans text-sm text-charcoal-500 hover:text-charcoal-900">
            Shipping &amp; Returns
          </Link>
          <Link href="/wishlist" className="font-sans text-sm text-charcoal-500 hover:text-charcoal-900">
            Almost Yours
          </Link>
          <span className="font-sans text-sm text-charcoal-500">Contact</span>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <p className="font-sans text-xs text-charcoal-500">
            © {new Date().getFullYear()} PAEGE. All rights reserved.
          </p>
          <p className="font-sans text-xs text-charcoal-500">Made with care.</p>
        </Container>
      </div>
    </footer>
  );
}
