import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getHomepageSlideById } from "@/lib/data/admin/homepage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomepageSlideForm } from "@/components/admin/HomepageSlideForm";

export const metadata: Metadata = { title: "Edit Homepage Slide" };

interface EditHomepageSlidePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHomepageSlidePage({ params }: EditHomepageSlidePageProps) {
  const { id } = await params;
  const slide = await getHomepageSlideById(id);
  if (!slide) notFound();

  return (
    <div>
      <AdminPageHeader title={slide.title || "Edit Slide"} description={slide.device === "desktop" ? "Desktop Hero" : "Mobile Hero"} />
      <div className="p-8">
        <HomepageSlideForm device={slide.device} slide={slide} />
      </div>
    </div>
  );
}
