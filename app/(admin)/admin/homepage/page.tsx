import type { Metadata } from "next";
import Link from "next/link";

import { getAllHomepageSlides } from "@/lib/data/admin/homepage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomepageSlideList } from "@/components/admin/HomepageSlideList";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  const [desktopSlides, mobileSlides] = await Promise.all([
    getAllHomepageSlides("desktop"),
    getAllHomepageSlides("mobile"),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Manage the desktop and mobile hero carousels."
        action={
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">Preview Live Homepage</Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-12 p-8">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Desktop Hero</h2>
            <Link href="/admin/homepage/new?device=desktop">
              <Button variant="outline">New Desktop Slide</Button>
            </Link>
          </div>
          <HomepageSlideList slides={desktopSlides} />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-sans text-xs uppercase tracking-wider text-charcoal-900">Mobile Hero</h2>
            <Link href="/admin/homepage/new?device=mobile">
              <Button variant="outline">New Mobile Slide</Button>
            </Link>
          </div>
          <HomepageSlideList slides={mobileSlides} />
        </section>
      </div>
    </div>
  );
}
