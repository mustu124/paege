import type { Metadata } from "next";

import { getBestsellers } from "@/lib/data/products";
import { CartPageClient } from "@/components/cart/CartPageClient";

export const metadata: Metadata = { title: "Cart" };

// Bestsellers are only actually needed if the cart turns out empty
// (client-side, after hydration) — fetched here regardless since a
// Server Component can't know that in advance, but it's a small,
// already-cached query the homepage also uses.
export default async function CartPage() {
  const recommendedProducts = await getBestsellers(4);
  return <CartPageClient recommendedProducts={recommendedProducts} />;
}
