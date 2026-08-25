import type { Metadata } from "next";

import { getAllInventory } from "@/lib/data/admin/inventory";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { InventoryTable } from "@/components/admin/InventoryTable";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const rows = await getAllInventory();

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Every stock change here is recorded — old quantity, new quantity, reason, admin, and time."
      />
      <div className="p-8">
        <InventoryTable rows={rows} />
      </div>
    </div>
  );
}
