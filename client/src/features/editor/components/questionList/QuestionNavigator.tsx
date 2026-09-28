import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { IconAlert } from '@/components/icons';
import { typeMeta } from '../questionTypes';
import { questionWarning } from '../../state/questionWarnings';
import { excerpt } from './excerpt';
import { QuestionPickerSheet } from './QuestionPickerSheet';
import type { QuestionListProps } from './types';

const stepBtn =
  'flex h-12 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors ' +
  'active:bg-slate-100 disabled:opacity-40';

/** Compact mobile navigator for quizzes with more questions than fit as chips. */
export function QuestionNavigator(props: QuestionListProps) {
  const { questions, selectedId, onSelect, onAdd } = props;
  const [open, setOpen] = useState(false);

  const index = Math.max(0, questions.findIndex((q) => q.id === selectedId));
  const current = questions[index];
  const warnings = questions.filter((q) => questionWarning(q)).length;
  const meta = current ? typeMeta(current.type) : null;
  const go = (i: number) => questions[i] && onSelect(questions[i].id);

  return (
    <>
      <div className="flex items-stretch gap-1.5">
        <button onClick={() => go(index - 1)} disabled={index === 0} className={stepBtn} aria-label="Previous question">
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => setOpen(true)}
          className="relative flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white pl-3 pr-2.5 text-left transition-colors active:bg-slate-50"
          aria-haspopup="dialog"
        >
          <span className="shrink-0 text-sm font-medium tabular-nums text-slate-900">
            {index + 1}
            <span className="font-normal text-slate-400"> / {questions.length}</span>
          </span>
          <span className="h-5 w-px shrink-0 bg-slate-200" />
          <span className="min-w-0 flex-1 space-y-0.5">
            <span className="block truncate text-[13px] leading-tight text-slate-800">{current ? excerpt(current) : ''}</span>
            {meta && (
              <span className="flex min-w-0 items-center gap-1 whitespace-nowrap text-[11px] leading-tight text-slate-500">
                <meta.icon className="h-3 w-3 shrink-0" /> <span className="truncate">{meta.label}</span>
              </span>
            )}
          </span>
          {warnings > 0 && (
            <span
              className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 py-0.5 pl-1 pr-1.5 text-[11px] font-medium tabular-nums text-amber-800"
              title={`${warnings} need attention`}
            >
              <IconAlert className="h-3 w-3" />
              {warnings}
            </span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-lg" aria-hidden>
            <span
              className="block h-full bg-brand-600 transition-[width]"
              style={{ width: `${((index + 1) / questions.length) * 100}%` }}
            />
          </span>
        </button>

        <button onClick={() => go(index + 1)} disabled={index >= questions.length - 1} className={stepBtn} aria-label="Next question">
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={onAdd}
          className="flex h-12 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-600 active:bg-slate-100"
          aria-label="Add question"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <QuestionPickerSheet {...props} open={open} onClose={() => setOpen(false)} warnings={warnings} />
    </>
  );
}
