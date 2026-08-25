import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border px-8 py-6">
      <div>
        <h1 className="font-serif text-2xl italic text-charcoal-900">{title}</h1>
        {description && <p className="mt-1 font-sans text-sm text-charcoal-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
