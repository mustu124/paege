import type { Metadata } from "next";

import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <Container className="py-10 md:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-10 mt-4 font-serif text-3xl italic text-charcoal-900 md:text-4xl">Checkout</h1>
      <CheckoutForm />
    </Container>
  );
}
