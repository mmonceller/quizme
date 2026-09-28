import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  leading,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex flex-wrap items-end gap-x-6 gap-y-4 border-b border-slate-200 pb-6', className)}>
      <div className="flex min-w-0 flex-1 items-end gap-5">
        {leading}
        <div className="min-w-0">
          {eyebrow && <div className="mb-1.5 text-[13px] text-slate-500">{eyebrow}</div>}
          <h1 className="truncate font-serif text-[2.1rem] leading-tight text-slate-900 sm:text-[2.5rem]">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-[13px] font-medium uppercase tracking-wider text-slate-500">{children}</h2>
      {action}
    </div>
  );
}
