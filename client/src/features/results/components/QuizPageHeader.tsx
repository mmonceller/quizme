import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

export function QuizPageHeader({
  backTo,
  backLabel,
  eyebrow,
  title,
  actions,
}: {
  backTo: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div>
      <Link to={backTo} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
      </Link>
      <PageHeader eyebrow={eyebrow} title={title} actions={actions && <div className="flex flex-wrap gap-2">{actions}</div>} />
    </div>
  );
}

export function VersionBadge({ version, current }: { version: number; current?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-px text-xs font-medium tabular-nums',
        current ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600',
      )}
    >
      v{version}
      {current && ' · current'}
    </span>
  );
}

export function ScorePill({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const bar = pct >= 75 ? 'bg-emerald-600' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-600';
  return (
    <span className="inline-flex items-center gap-2.5 text-sm tabular-nums">
      <span className="font-medium text-slate-900">
        {score}/{max}
      </span>
      <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-slate-200 sm:block">
        <span className={cn('block h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
      </span>
      <span className="w-9 text-right text-slate-500">{pct}%</span>
    </span>
  );
}
