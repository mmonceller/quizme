import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-brand-700' : 'bg-slate-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-4.5 w-4.5 rounded-full bg-white transition-transform',
          checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900">{label}</div>
        {description && <div className="mt-0.5 text-sm text-slate-500">{description}</div>}
      </div>
      {sw}
    </div>
  );
}
