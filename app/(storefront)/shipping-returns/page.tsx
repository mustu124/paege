import type { Metadata } from "next";
import Image from "next/image";
import { AlertCircle, Mail, Package, RotateCcw } from "lucide-react";

import { getSiteImages } from "@/lib/data/site-images";
import { getSupportContact } from "@/lib/data/support-contact";
import { getStorageUrl } from "@/lib/storage";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Shipping & Return Policy" };

export default async function ShippingReturnsPage() {
  const [siteImages, contact] = await Promise.all([getSiteImages(), getSupportContact()]);
  const hasContact = contact.email !== "" || contact.instagram !== "";

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

      <div className="mx-auto mt-16 flex max-w-5xl flex-col gap-16">
        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <Package size={28} strokeWidth={1.25} className="text-burgundy" />
            <h2 className="mt-4 font-serif text-2xl italic text-charcoal-900">Shipping Policy</h2>
            <div className="mt-2 h-px w-10 bg-burgundy" />
            <div className="mt-5 flex flex-col gap-4 font-sans text-sm leading-relaxed text-charcoal-700">
              <p>At PAEGE, every piece is made and packed with care.</p>
              <p>
                Orders are processed and shipped with the utmost attention to detail. Please note
                that <strong className="font-medium text-charcoal-900">shipping may take anywhere between 10–15 days</strong>{" "}
                from the date of order.
              </p>
              <p>We request you to be patient while your PAEGE piece makes its way to you.</p>
              <p>Once your order has been dispatched, you will receive the relevant shipping details to track your parcel.</p>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
            <Image
              src={getStorageUrl("homepage-slides", siteImages.shipping_policy?.storage_path)}
              alt={siteImages.shipping_policy?.alt_text ?? "A PAEGE order, carefully packed"}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100 md:order-2">
            <Image
              src={getStorageUrl("homepage-slides", siteImages.returns_policy?.storage_path)}
              alt={siteImages.returns_policy?.alt_text ?? "A PAEGE order being unboxed"}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="md:order-1">
            <RotateCcw size={28} strokeWidth={1.25} className="text-burgundy" />
            <h2 className="mt-4 font-serif text-2xl italic text-charcoal-900">Return &amp; Exchange Policy</h2>
            <div className="mt-2 h-px w-10 bg-burgundy" />
            <div className="mt-5 flex flex-col gap-4 font-sans text-sm leading-relaxed text-charcoal-700">
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
                <AlertCircle size={14} strokeWidth={1.5} />
                No video = No exchange.
              </p>
              <p>Thank you for understanding and helping us keep the process fair for everyone.</p>
            </div>
          </div>
        </section>

        {hasContact && (
          <div className="border-t border-border pt-10 text-center">
            <p className="font-sans text-xs uppercase tracking-widest text-charcoal-500">Need Help?</p>
            <div className="mt-3 flex flex-col items-center justify-center gap-2 font-sans text-sm text-charcoal-700 sm:flex-row sm:gap-6">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="link-underline flex items-center gap-2 text-charcoal-900"
                >
                  <Mail size={15} strokeWidth={1.5} />
                  {contact.email}
                </a>
              )}
              {contact.instagram && (
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-charcoal-900"
                >
                  @{contact.instagram}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
