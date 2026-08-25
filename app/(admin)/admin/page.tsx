import type { Metadata } from "next";
import Link from "next/link";

import { getDashboardStats, getStockAlerts, getRecentOrders, getBestsellingProducts } from "@/lib/data/admin/dashboard";
import { formatPaise } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatTile } from "@/components/admin/StatTile";
import { AdminTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from "@/components/admin/AdminTable";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const [stats, stockAlerts, recentOrders, bestselling] = await Promise.all([
    getDashboardStats(),
    getStockAlerts(),
    getRecentOrders(),
    getBestsellingProducts(),
  ]);

  return (
    <div>
      <AdminPageHeader title="Dashboard" description="An overview of store performance and health." />

      <div className="p-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Revenue" value={formatPaise(stats.revenuePaise)} accent />
          <StatTile label="Total Orders" value={String(stats.totalOrders)} />
          <StatTile label="Pending" value={String(stats.pendingOrders)} />
          <StatTile label="Processing" value={String(stats.processingOrders)} />
          <StatTile label="Low Stock" value={String(stockAlerts.lowStock.length)} accent={stockAlerts.lowStock.length > 0} />
          <StatTile label="Out of Stock" value={String(stockAlerts.outOfStock.length)} accent={stockAlerts.outOfStock.length > 0} />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <EmptyState title="No orders yet" description="Orders will appear here as customers check out." />
            ) : (
              <AdminTable>
                <AdminTableHead>
                  <AdminTh>Order</AdminTh>
                  <AdminTh>Customer</AdminTh>
                  <AdminTh>Status</AdminTh>
                  <AdminTh className="text-right">Total</AdminTh>
                </AdminTableHead>
                <tbody>
                  {recentOrders.map((order) => (
                    <AdminTr key={order.id}>
                      <AdminTd>
                        <Link href={`/admin/orders/${order.id}`} className="link-underline">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </AdminTd>
                      <AdminTd className="text-charcoal-500">{order.customerEmail ?? "—"}</AdminTd>
                      <AdminTd>
                        <OrderStatusBadge status={order.status} />
                      </AdminTd>
                      <AdminTd className="text-right">{formatPaise(order.totalPaise)}</AdminTd>
                    </AdminTr>
                  ))}
                </tbody>
              </AdminTable>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-charcoal-900">Bestselling Products</h2>
            {bestselling.length === 0 ? (
              <EmptyState title="No sales data yet" description="Bestsellers are computed from confirmed orders." />
            ) : (
              <AdminTable>
                <AdminTableHead>
                  <AdminTh>Product</AdminTh>
                  <AdminTh className="text-right">Units Sold</AdminTh>
                </AdminTableHead>
                <tbody>
                  {bestselling.map((p) => (
                    <AdminTr key={p.productId}>
                      <AdminTd>
                        <Link href={`/admin/products/${p.productId}`} className="link-underline">
                          {p.productName}
                        </Link>
                      </AdminTd>
                      <AdminTd className="text-right">{p.unitsSold}</AdminTd>
                    </AdminTr>
                  ))}
                </tbody>
              </AdminTable>
            )}
          </section>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-burgundy">Low Stock</h2>
            {stockAlerts.lowStock.length === 0 ? (
              <p className="font-sans text-sm text-charcoal-500">Nothing is running low.</p>
            ) : (
              <ul className="divide-y divide-border border-y border-border font-sans text-sm">
                {stockAlerts.lowStock.map((row) => (
                  <li key={row.variantId} className="flex justify-between px-2 py-2.5">
                    <Link href={`/admin/inventory`} className="link-underline">
                      {row.productName} — {row.size}
                    </Link>
                    <span className="text-burgundy">{row.quantity} left</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-sans text-xs uppercase tracking-wider text-burgundy">Out of Stock</h2>
            {stockAlerts.outOfStock.length === 0 ? (
              <p className="font-sans text-sm text-charcoal-500">Nothing is out of stock.</p>
            ) : (
              <ul className="divide-y divide-border border-y border-border font-sans text-sm">
                {stockAlerts.outOfStock.map((row) => (
                  <li key={row.variantId} className="flex justify-between px-2 py-2.5">
                    <Link href={`/admin/inventory`} className="link-underline">
                      {row.productName} — {row.size}
                    </Link>
                    <span className="text-burgundy">0</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
