import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-charcoal-900/[0.06]", className)}
      aria-hidden="true"
    />
  );
}
