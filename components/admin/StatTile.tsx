import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatTile({ label, value, accent = false }: StatTileProps) {
  return (
    <div className="border border-border px-5 py-4">
      <p className="font-sans text-xs uppercase tracking-wider text-charcoal-500">{label}</p>
      <p className={cn("mt-2 font-serif text-2xl italic", accent ? "text-burgundy" : "text-charcoal-900")}>{value}</p>
    </div>
  );
}
