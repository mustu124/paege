import type { ReactNode } from "react";

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[640px] border-collapse font-sans text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border bg-cream-100 text-left">{children}</tr>
    </thead>
  );
}

export function AdminTh({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 font-sans text-xs uppercase tracking-wider text-charcoal-700 ${className}`}>
      {children}
    </th>
  );
}

export function AdminTd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle text-charcoal-900 ${className}`}>{children}</td>;
}

export function AdminTr({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border last:border-b-0 hover:bg-charcoal-900/[0.015]">{children}</tr>;
}
