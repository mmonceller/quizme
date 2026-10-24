import type { ReactNode } from 'react';

/** Label on the left, control on the right (stacked on small screens). */
export function SettingRow({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[132px_1fr] sm:items-center sm:gap-4">
      <div>
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
