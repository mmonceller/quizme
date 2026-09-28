import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  title,
  description,
  children,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-5 sm:p-6', className)}>
      {title && (
        <header className="mb-5">
          <h2 className="font-display text-base font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
