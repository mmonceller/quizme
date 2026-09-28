import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { questionWarning } from '../../state/questionWarnings';
import { typeMeta } from '../questionTypes';
import { excerpt } from './excerpt';
import { QuestionRow } from './QuestionRow';
import type { QuestionListProps } from './types';

type Props = QuestionListProps & { open: boolean; onClose: () => void; warnings: number };

/** Full, searchable question list in a bottom sheet. */
export function QuestionPickerSheet({ open, onClose, warnings, questions, selectedId, onSelect, onMove, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setIssuesOnly(false);
    requestAnimationFrame(() => activeRef.current?.scrollIntoView({ block: 'center' }));
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const asNumber = /^\d+$/.test(q) ? Number(q) : null;
    return questions
      .map((question, index) => ({ question, index }))
      .filter(({ question, index }) => {
        if (issuesOnly && !questionWarning(question)) return false;
        if (!q) return true;
        if (asNumber !== null && index + 1 === asNumber) return true;
        return (
          excerpt(question).toLowerCase().includes(q) || typeMeta(question.type).label.toLowerCase().includes(q)
        );
      });
  }, [questions, query, issuesOnly]);

  const filtering = !!query.trim() || issuesOnly;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Questions"
      description={`${questions.length} questions${warnings ? ` · ${warnings} need attention` : ''}`}
      footer={
        <Button
          className="w-full"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            onClose();
            onAdd();
          }}
        >
          Add question
        </Button>
      }
    >
      <div className="sticky -top-6 z-10 -mx-6 -mt-6 mb-3 space-y-2.5 border-b border-slate-100 bg-white px-6 pb-3 pt-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search text, type, or number"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          />
        </div>
        {warnings > 0 && (
          <button
            onClick={() => setIssuesOnly((v) => !v)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              issuesOnly ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-slate-200 text-slate-600',
            )}
          >
            Needs attention · {warnings}
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">No questions match.</p>
      ) : (
        <div className="space-y-1.5">
          {visible.map(({ question, index }) => (
            <QuestionRow
              key={question.id}
              ref={question.id === selectedId ? activeRef : undefined}
              question={question}
              index={index}
              total={questions.length}
              active={question.id === selectedId}
              onSelect={() => {
                onSelect(question.id);
                onClose();
              }}
              onMove={onMove}
              alwaysShowControls={!filtering}
            />
          ))}
        </div>
      )}
    </Modal>
  );
}
