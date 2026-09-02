"use client";

import { useState, useTransition } from "react";

import type { SupportContact } from "@/lib/data/support-contact";
import { setSupportContactAction } from "@/app/(admin)/admin/site-images/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// Shown on the Shipping & Return Policy page's "Need Help?" line —
// either field left blank just skips that line on the storefront
// rather than showing something empty.
export function SupportContactForm({ contact }: { contact: SupportContact }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setSupportContactAction(formData);
      if (result?.error) setError(result.error);
      else setSaved(true);
    });
  }

  return (
    <div className="border border-border p-6">
      <p className="font-sans text-sm text-charcoal-900">Support Contact</p>
      <p className="mt-1 font-sans text-xs text-charcoal-500">
        Shown as a &quot;Need Help?&quot; line on the Shipping &amp; Return Policy page. Leave a field blank to hide it.
      </p>

      <form action={onSubmit} className="mt-4 flex flex-wrap items-end gap-4">
        <Input
          name="email"
          type="email"
          label="Support Email"
          defaultValue={contact.email}
          placeholder="hello@paege.co.in"
          className="w-64"
        />
        <Input
          name="instagram"
          label="Instagram Handle"
          defaultValue={contact.instagram}
          placeholder="paege.co.in (without the @)"
          className="w-64"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </form>

      {error && <p className="mt-2 font-sans text-xs text-burgundy">{error}</p>}
      {saved && !error && <p className="mt-2 font-sans text-xs text-charcoal-500">Saved.</p>}
    </div>
  );
}
