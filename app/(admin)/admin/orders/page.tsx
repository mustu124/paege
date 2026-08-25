import type { Metadata } from "next";

import { getAllOrdersAdmin } from "@/lib/data/admin/orders";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersAdmin();

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${orders.length} order${orders.length === 1 ? "" : "s"}`} />
      <div className="p-8">
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
