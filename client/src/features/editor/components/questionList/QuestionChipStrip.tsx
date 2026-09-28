import { forwardRef } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { typeMeta } from '../questionTypes';
import { questionWarning } from '../../state/questionWarnings';
import type { QuestionListProps } from './types';

type Props = Omit<QuestionListProps, 'onMove'> & { className?: string; hidden?: boolean };

/** One chip per question; used on mobile while every chip fits on one line. */
export const QuestionChipStrip = forwardRef<HTMLDivElement, Props>(function QuestionChipStrip(
  { questions, selectedId, onSelect, onAdd, className, hidden },
  ref,
) {
  return (
    <div ref={ref} aria-hidden={hidden || undefined} className={cn('-mx-4 flex gap-2 overflow-hidden px-4 pb-1', className)}>
      {questions.map((q, i) => {
        const meta = typeMeta(q.type);
        return (
          <button
            key={q.id}
            onClick={() => onSelect(q.id)}
            tabIndex={hidden ? -1 : undefined}
            className={cn(
              'relative flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm tabular-nums transition-colors',
              q.id === selectedId ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-200 bg-white text-slate-600',
            )}
          >
            <meta.icon className="h-3.5 w-3.5 opacity-70" />
            {i + 1}
            {questionWarning(q) && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-slate-50" />}
          </button>
        );
      })}
      <button
        onClick={onAdd}
        tabIndex={hidden ? -1 : undefined}
        className="flex h-10 shrink-0 items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3.5 text-sm text-slate-600"
      >
        <Plus className="h-4 w-4" /> Add
      </button>
    </div>
  );
});
