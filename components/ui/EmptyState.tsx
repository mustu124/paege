import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 border border-border px-6 py-20 text-center">
      <p className="font-serif text-2xl italic text-charcoal-900">{title}</p>
      {description && (
        <p className="max-w-sm font-sans text-sm text-charcoal-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
