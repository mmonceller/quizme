import { Plus } from 'lucide-react';
import type { QuestionListProps } from './types';
import { QuestionRow } from './QuestionRow';

export function DesktopQuestionList({ questions, selectedId, onSelect, onMove, onAdd }: QuestionListProps) {
  return (
    <div className="hidden lg:block">
      <div className="mb-3 flex items-center justify-between px-1">
        <span className="text-[13px] font-medium uppercase tracking-wider text-slate-500">Questions</span>
        <span className="text-xs tabular-nums text-slate-400">{questions.length}</span>
      </div>
      <div className="space-y-1.5">
        {questions.map((q, i) => (
          <QuestionRow
            key={q.id}
            question={q}
            index={i}
            total={questions.length}
            active={q.id === selectedId}
            onSelect={() => onSelect(q.id)}
            onMove={onMove}
          />
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 py-2.5 text-sm text-slate-600 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-900"
      >
        <Plus className="h-4 w-4" /> Add question
      </button>
    </div>
  );
}
