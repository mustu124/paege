import type { Metadata } from "next";

import { NotFoundContent } from "@/components/ui/NotFoundContent";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

// Next.js's App Router has a long-standing, unresolved upstream issue
// (vercel/next.js#76474) where notFound() renders this page correctly
// but the outer HTTP response still reports 200 once streaming is
// involved anywhere in the render (which it always is, even from the
// root layout) — there's no accepted framework-level fix. The one
// consequence within our control is search engines potentially
// indexing these as real 200 pages; noindex here prevents that
// regardless of the status code the transport layer actually sent.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// This is the ROOT not-found boundary — it catches a URL that
// doesn't match any route at all, so it sits structurally outside
// every route group's layout (including (storefront)'s). It can't
// "borrow" that layout the way (storefront)/not-found.tsx does, so
// header/footer are rendered directly here instead, to avoid a
// completely bare dead-end page with no way back into the site.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </div>
  );
}
