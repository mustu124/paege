"use client";

import { useMemo, useState } from "react";

import type { InventoryRow } from "@/lib/data/admin/inventory";
import { AdminTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from "@/components/admin/AdminTable";
import { StockAdjustControl } from "@/components/admin/StockAdjustControl";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const STATUS_LABEL = { in_stock: "In Stock", low_stock: "Low Stock", out_of_stock: "Out of Stock" } as const;

export function InventoryTable({ rows }: { rows: InventoryRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.productName.toLowerCase().includes(q) || r.size.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div>
      <Input
        placeholder="Search by product or size…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-xs"
      />

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Product</AdminTh>
          <AdminTh>Size</AdminTh>
          <AdminTh>Current Stock</AdminTh>
          <AdminTh>Status</AdminTh>
        </AdminTableHead>
        <tbody>
          {filtered.map((row) => (
            <AdminTr key={row.variantId}>
              <AdminTd>{row.productName}</AdminTd>
              <AdminTd>{row.size}</AdminTd>
              <AdminTd>
                <StockAdjustControl variantId={row.variantId} quantity={row.quantity} />
              </AdminTd>
              <AdminTd>
                <span
                  className={cn(
                    "font-sans text-xs uppercase tracking-wider",
                    row.status === "out_of_stock" ? "text-burgundy" : row.status === "low_stock" ? "text-burgundy" : "text-charcoal-700",
                  )}
                >
                  {STATUS_LABEL[row.status]}
                </span>
              </AdminTd>
            </AdminTr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}
