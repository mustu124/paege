import type { Metadata } from "next";

import { getAllBestsellersAdmin, getBestsellerCandidates, getBestsellersDisplayCountAdmin } from "@/lib/data/admin/bestsellers";
import { getNewArrivalCandidates, getNewArrivalsAdmin } from "@/lib/data/admin/new-arrivals";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BestsellersManager } from "@/components/admin/BestsellersManager";
import { NewArrivalsManager } from "@/components/admin/NewArrivalsManager";

export const metadata: Metadata = { title: "Bestsellers & New Arrivals" };

export default async function AdminFeaturedPage() {
  const [bestsellerRows, bestsellerCandidates, displayCount, newArrivalRows, newArrivalCandidates] = await Promise.all([
    getAllBestsellersAdmin(),
    getBestsellerCandidates(),
    getBestsellersDisplayCountAdmin(),
    getNewArrivalsAdmin(),
    getNewArrivalCandidates(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Bestsellers & New Arrivals"
        description="Curate which products appear in each homepage rail and in what order."
      />
      <div className="flex flex-col gap-12 p-8">
        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Bestsellers</h2>
          <BestsellersManager rows={bestsellerRows} candidates={bestsellerCandidates} displayCount={displayCount} />
        </section>

        <section>
          <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">New Arrivals</h2>
          <NewArrivalsManager rows={newArrivalRows} candidates={newArrivalCandidates} />
        </section>
      </div>
    </div>
  );
}
