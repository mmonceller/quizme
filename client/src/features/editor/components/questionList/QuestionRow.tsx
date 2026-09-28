import { forwardRef } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Question } from '@shared/types';
import { cn } from '@/lib/utils';
import { IconAlert } from '@/components/icons';
import { typeMeta } from '../questionTypes';
import { questionWarning } from '../../state/questionWarnings';
import { excerpt } from './excerpt';

interface Props {
  question: Question;
  index: number;
  total: number;
  active: boolean;
  onSelect: () => void;
  onMove: (from: number, to: number) => void;
  /** Keep reorder controls visible (touch devices have no hover). */
  alwaysShowControls?: boolean;
}

export const QuestionRow = forwardRef<HTMLDivElement, Props>(function QuestionRow(
  { question, index, total, active, onSelect, onMove, alwaysShowControls },
  ref,
) {
  const meta = typeMeta(question.type);
  const warning = questionWarning(question);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      className={cn(
        'group relative flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
        active ? 'border-brand-600 bg-white ring-1 ring-brand-600' : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      <span className={cn('w-5 shrink-0 pt-px text-right text-sm tabular-nums', active ? 'font-medium text-brand-700' : 'text-slate-400')}>
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <meta.icon className="h-3 w-3" /> {meta.label}
        </div>
        <div className="mt-0.5 line-clamp-2 text-sm text-slate-800">{excerpt(question)}</div>
        {warning && (
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-700">
            <IconAlert className="h-3.5 w-3.5 shrink-0" /> {warning}
          </div>
        )}
      </div>
      <div
        className={cn(
          'flex flex-col text-slate-400 transition-opacity',
          alwaysShowControls ? '-my-1 -mr-1' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(index, index - 1);
          }}
          disabled={index === 0}
          className={cn('rounded hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30', alwaysShowControls ? 'p-1.5' : 'p-0.5')}
          aria-label="Move up"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove(index, index + 1);
          }}
          disabled={index === total - 1}
          className={cn('rounded hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30', alwaysShowControls ? 'p-1.5' : 'p-0.5')}
          aria-label="Move down"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
});
