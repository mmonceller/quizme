import type { QuestionType } from '@shared/types';
import { Modal } from '@/components/ui';
import { QUESTION_TYPES } from './questionTypes';

export function AddQuestionModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (type: QuestionType) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Add a question" description="Choose a question type." size="lg">
      <div className="grid gap-2 sm:grid-cols-2">
        {QUESTION_TYPES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => {
              onPick(t.type);
              onClose();
            }}
            className="group flex items-center gap-3.5 rounded-lg border border-slate-200 p-3.5 text-left transition-colors hover:border-brand-600 hover:bg-brand-50/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 group-hover:border-brand-200 group-hover:text-brand-700">
              <t.icon className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-medium text-slate-900">{t.label}</span>
              <span className="block text-[13px] text-slate-500">{t.description}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
