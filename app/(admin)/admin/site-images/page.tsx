import type { Metadata } from "next";

import { getSiteImages, type SiteImageKey } from "@/lib/data/site-images";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SiteImageForm } from "@/components/admin/SiteImageForm";

export const metadata: Metadata = { title: "Site Images" };

// Every marketing photo that isn't a product photo, a homepage hero
// slide, or a category tile (those already have their own admin
// screens) — the handful embedded directly in page layouts. Add a
// row here whenever a new one is hard-coded into a component instead
// of read from site_images.
const SLOTS: { key: SiteImageKey; label: string; usedOn: string }[] = [
  { key: "featured_editorial", label: "Slow Fashion Banner", usedOn: "Homepage — full-width banner below The Edit" },
  { key: "about_page", label: "About Page Photo", usedOn: "About Us — side image next to the story" },
];

export default async function SiteImagesPage() {
  const images = await getSiteImages();

  return (
    <div>
      <AdminPageHeader
        title="Site Images"
        description="Photos used directly in page layouts — product photos, homepage slides, and category tiles are managed from their own sections instead."
      />
      <div className="flex flex-col gap-6 p-8">
        {SLOTS.map((slot) => (
          <SiteImageForm key={slot.key} imageKey={slot.key} label={slot.label} usedOn={slot.usedOn} image={images[slot.key]} />
        ))}
      </div>
    </div>
  );
}
