"use client";

import { useRef, useState, useTransition } from "react";

import type { HomepageSlide } from "@/lib/data/homepage-slides";
import type { HeroDevice } from "@/lib/types/database";
import { getStorageUrl } from "@/lib/storage";
import { createHomepageSlideAction, updateHomepageSlideAction } from "@/app/(admin)/admin/homepage/actions";
import type { ActionResult } from "@/lib/types/admin-actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SiteImage } from "@/components/ui/SiteImage";

export function HomepageSlideForm({ device, slide }: { device: HeroDevice; slide?: HomepageSlide }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [useUrl, setUseUrl] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onSubmit(formData: FormData) {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const action: (fd: FormData) => Promise<ActionResult> = slide
        ? (fd) => updateHomepageSlideAction(slide.id, fd)
        : createHomepageSlideAction;
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFilePreview(file ? URL.createObjectURL(file) : null);
  }

  const currentImageUrl = slide ? getStorageUrl("homepage-slides", slide.image_path) : null;

  return (
    <form action={onSubmit} className="flex max-w-lg flex-col gap-4">
      <input type="hidden" name="device" value={device} />

      <div className="flex items-end gap-4">
        {(filePreview ?? currentImageUrl) && (
          <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden border border-border bg-cream-100">
            <SiteImage src={filePreview ?? currentImageUrl!} alt="" fill sizes="128px" className="object-cover" />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3">
          {!useUrl ? (
            <label className="flex flex-col gap-1.5">
              <span className="font-sans text-xs uppercase tracking-wider text-charcoal-700">
                {slide ? "Replace Image" : "Image"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept="image/*"
                onChange={onFileSelected}
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
        </div>
      </div>

      <Input name="title" label="Title (optional)" defaultValue={slide?.title ?? ""} />
      <Input name="subtitle" label="Subtitle (optional)" defaultValue={slide?.subtitle ?? ""} />
      <Input name="ctaLabel" label="CTA Label (optional)" defaultValue={slide?.cta_label ?? ""} />
      <Input name="linkUrl" label="CTA Destination (optional)" defaultValue={slide?.link_url ?? ""} placeholder="/shop" />
      <Input name="displayOrder" type="number" label="Display Order" defaultValue={slide?.display_order ?? 0} />

      <label className="flex items-center gap-2 font-sans text-sm text-charcoal-900">
        <input type="checkbox" name="isActive" defaultChecked={slide?.is_active ?? false} />
        Active (counts toward the 5-slot limit for this device)
      </label>

      {error && <p className="font-sans text-xs text-burgundy">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-2 w-fit">
        {pending ? "Saving…" : slide ? "Save Changes" : "Create Slide"}
      </Button>
    </form>
  );
}
