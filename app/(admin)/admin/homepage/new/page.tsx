import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HomepageSlideForm } from "@/components/admin/HomepageSlideForm";
import type { HeroDevice } from "@/lib/types/database";

export const metadata: Metadata = { title: "New Homepage Slide" };

interface NewHomepageSlidePageProps {
  searchParams: Promise<{ device?: string }>;
}

export default async function NewHomepageSlidePage({ searchParams }: NewHomepageSlidePageProps) {
  const { device } = await searchParams;
  const resolvedDevice: HeroDevice = device === "mobile" ? "mobile" : "desktop";

  return (
    <div>
      <AdminPageHeader title={`New ${resolvedDevice === "desktop" ? "Desktop" : "Mobile"} Slide`} />
      <div className="p-8">
        <HomepageSlideForm device={resolvedDevice} />
      </div>
    </div>
  );
}
