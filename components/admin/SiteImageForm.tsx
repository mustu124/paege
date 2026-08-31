"use client";

import { useRef, useState, useTransition } from "react";

import type { SiteImageKey, SiteImageRow } from "@/lib/data/site-images";
import { getStorageUrl } from "@/lib/storage";
import { setSiteImageAction } from "@/app/(admin)/admin/site-images/actions";
import { SiteImage } from "@/components/ui/SiteImage";
import { Button } from "@/components/ui/Button";

interface SiteImageFormProps {
  imageKey: SiteImageKey;
  label: string;
  usedOn: string;
  image: SiteImageRow | null;
}

// One of these per named slot on /admin/site-images — deliberately
// just an image picker + alt text + Save, no title/CTA/ordering
// fields like the homepage-slide form has, since a slot is always a
// single fixed photo in a fixed layout.
export function SiteImageForm({ imageKey, label, usedOn, image }: SiteImageFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await setSiteImageAction(imageKey, formData);
      if (result?.error) setError(result.error);
      else {
        setSaved(true);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  const currentImageUrl = getStorageUrl("homepage-slides", image?.storage_path);

  return (
    <div className="border border-border p-6">
      <p className="font-sans text-sm text-charcoal-900">{label}</p>
      <p className="mt-1 font-sans text-xs text-charcoal-500">{usedOn}</p>

      <form action={onSubmit} className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden border border-border bg-cream-100">
          <SiteImage src={filePreview ?? currentImageUrl} alt="" fill sizes="128px" className="object-cover" />
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {!useUrl ? (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Replace Image</span>
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setFilePreview(file ? URL.createObjectURL(file) : null);
                }}
                className="font-sans text-sm text-charcoal-900"
              />
            </label>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Image URL</span>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://…"
                className="border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => {
              setUseUrl((v) => !v);
              setFilePreview(null);
            }}
            className="link-underline w-fit font-sans text-xs uppercase tracking-wider text-charcoal-700"
          >
            {useUrl ? "Upload a file instead" : "Use an image URL instead"}
          </button>

          <label className="flex flex-col gap-1.5">
            <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">Alt Text</span>
            <input
              name="altText"
              defaultValue={image?.alt_text ?? ""}
              className="border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
            />
          </label>

          {error && <p className="font-sans text-xs text-burgundy">{error}</p>}
          {saved && !error && <p className="font-sans text-xs text-charcoal-500">Saved.</p>}

          <Button type="submit" disabled={pending} className="w-fit">
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
