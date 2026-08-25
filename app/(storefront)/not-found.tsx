import type { Metadata } from "next";

import { NotFoundContent } from "@/components/ui/NotFoundContent";

// See app/not-found.tsx for why this exists as a separate file
// rather than relying on the root one: without it, a notFound() call
// from inside (storefront) — e.g. an invalid product slug — bubbles
// past this layout entirely and renders bare, with no header/nav to
// get back into the shop.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StorefrontNotFound() {
  return (
    <NotFoundContent
      title="Not Found"
      description="We couldn't find what you were looking for. It may have sold out or been removed."
      actionLabel="Continue Shopping"
      actionHref="/shop"
    />
  );
}
