"use client";

import { useState, useTransition } from "react";
import { TriangleAlert } from "lucide-react";

import { forceConfirmOrderAction } from "@/app/(admin)/admin/orders/actions";
import { Button } from "@/components/ui/Button";

export function ForceConfirmControl({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function onConfirm() {
    if (pending) return;
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    if (!window.confirm("This will manually mark the order as paid and confirmed, decrementing stock, without a verified Razorpay payment. This is logged and audited. Continue?")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await forceConfirmOrderAction(orderId, reason);
      if (result?.error) setError(result.error);
      else setReason("");
    });
  }

  return (
    <div className="border border-burgundy/40 bg-burgundy/5 p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-burgundy" />
        <div className="flex-1">
          <p className="font-sans text-sm text-charcoal-900">Manually confirm without verified payment</p>
          <p className="mt-1 font-sans text-xs text-charcoal-500">
            Use only when payment was genuinely received through another channel. This decrements stock, requires a
            reason, and is permanently recorded in the audit log.
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (required) — e.g. payment confirmed via bank transfer, ref #..."
            rows={2}
            className="mt-3 w-full border border-border bg-cream-50 px-3 py-2 font-sans text-sm text-charcoal-900 outline-none focus:border-charcoal-900"
          />

          {error && <p className="mt-2 font-sans text-xs text-burgundy">{error}</p>}

          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onConfirm} className="mt-3">
            {pending ? "Confirming…" : "Force Confirm Order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
