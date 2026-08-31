import type { Metadata } from "next";
import { Package, RotateCcw } from "lucide-react";

import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Shipping & Return Policy" };

export default function ShippingReturnsPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-serif text-4xl italic text-charcoal-900 md:text-5xl">
          Shipping &amp; Return Policy
        </h1>
        <p className="mt-4 font-sans text-xs uppercase tracking-widest text-charcoal-500">
          Made with intention. Delivered with care.
        </p>
      </div>

      <div className="mx-auto mt-16 flex max-w-3xl flex-col divide-y divide-border">
        <section className="flex flex-col gap-4 pb-12">
          <Package size={28} strokeWidth={1.25} className="text-burgundy" />
          <h2 className="font-serif text-2xl italic text-charcoal-900">Shipping Policy</h2>
          <div className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-charcoal-700">
            <p>At PAEGE, every piece is made and packed with care.</p>
            <p>
              Orders are processed and shipped with the utmost attention to detail. Please
              note that <strong className="font-medium text-charcoal-900">shipping may take anywhere between 10–15 days</strong>{" "}
              from the date of order.
            </p>
            <p>We request you to be patient while your PAEGE piece makes its way to you.</p>
            <p>Once your order has been dispatched, you will receive the relevant shipping details to track your parcel.</p>
          </div>
        </section>

        <section className="flex flex-col gap-4 pt-12">
          <RotateCcw size={28} strokeWidth={1.25} className="text-burgundy" />
          <h2 className="font-serif text-2xl italic text-charcoal-900">Return &amp; Exchange Policy</h2>
          <div className="flex flex-col gap-4 font-sans text-sm leading-relaxed text-charcoal-700">
            <p className="font-medium text-charcoal-900">All PAEGE orders are final sale.</p>
            <p>
              We do not accept returns or exchanges unless the product arrives{" "}
              <strong className="font-medium text-charcoal-900">damaged or defective</strong>.
            </p>
            <p>
              In the unlikely event that your parcel arrives damaged, you must provide{" "}
              <strong className="font-medium text-charcoal-900">
                a continuous, unedited video of the parcel being opened
              </strong>
              , clearly showing the condition of the packaging and the product inside.
            </p>
            <p className="inline-flex w-fit items-center gap-2 border border-burgundy px-4 py-2 font-sans text-xs uppercase tracking-widest text-burgundy">
              No video = No exchange.
            </p>
            <p>Thank you for understanding and helping us keep the process fair for everyone.</p>
          </div>
        </section>
      </div>
    </Container>
  );
}
