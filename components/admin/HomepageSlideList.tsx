"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { X } from "lucide-react";

import type { HomepageSlide } from "@/lib/data/homepage-slides";
import { getStorageUrl } from "@/lib/storage";
import { deleteHomepageSlideAction, reorderHomepageSlideAction, toggleHomepageSlideActiveAction } from "@/app/(admin)/admin/homepage/actions";
import { ReorderButtons } from "@/components/admin/ReorderButtons";
import { ToggleActiveButton } from "@/components/admin/ToggleActiveButton";
import { SiteImage } from "@/components/ui/SiteImage";

export function HomepageSlideList({ slides }: { slides: HomepageSlide[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const activeCount = slides.filter((s) => s.is_active).length;

  function onDelete(id: string, imagePath: string) {
    if (pending) return;
    if (!window.confirm("Delete this slide? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteHomepageSlideAction(id, imagePath);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <p className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-500">
        {activeCount} / 5 active slots used
      </p>

      {error && <p className="mb-4 font-sans text-xs text-burgundy">{error}</p>}

      {slides.length === 0 ? (
        <p className="font-sans text-sm text-charcoal-500">No slides yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className="border border-border p-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
                <SiteImage
                  src={getStorageUrl("homepage-slides", slide.image_path)}
                  alt=""
                  fill
                  sizes="300px"
                  className="object-cover"
                />
              </div>

              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-serif text-sm italic text-charcoal-900">{slide.title || "Untitled"}</p>
                  <p className="truncate font-sans text-xs text-charcoal-500">{slide.subtitle}</p>
                </div>
                <ToggleActiveButton id={slide.id} isActive={slide.is_active} action={toggleHomepageSlideActiveAction} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <ReorderButtons
                  id={slide.id}
                  disableUp={i === 0}
                  disableDown={i === slides.length - 1}
                  action={reorderHomepageSlideAction}
                />
                <div className="flex items-center gap-3">
                  <Link href={`/admin/homepage/${slide.id}`} className="link-underline font-sans text-xs uppercase tracking-wider">
                    Edit
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete slide"
                    disabled={pending}
                    onClick={() => onDelete(slide.id, slide.image_path)}
                    className="p-1 text-charcoal-500 hover:text-burgundy"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
