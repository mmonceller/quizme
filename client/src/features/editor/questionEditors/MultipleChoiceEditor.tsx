import { Check, Plus, X } from 'lucide-react';
import { choiceLetter, resolveChoiceLayout } from '@shared/choiceLayout';
import type { ChoiceLayout, MultipleChoiceQuestion } from '@shared/types';
import { Input } from '@/components/ui';
import { SignLetter } from '@/components/icons';
import { cn, uid } from '@/lib/utils';
import { ChoiceIconPicker } from '../components/ChoiceIconPicker';
import { ChoiceLayoutControls } from '../components/ChoiceLayoutControls';
import { ImageUpload } from '../components/ImageUpload';
import type { TypeEditorProps } from './types';

export function MultipleChoiceEditor({ q, onChange }: TypeEditorProps<MultipleChoiceQuestion>) {
  const setChoice = (id: string, patch: Partial<MultipleChoiceQuestion['choices'][number]>) =>
    onChange({ choices: q.choices.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const layout = resolveChoiceLayout(q);
  const setLayout = (patch: Partial<ChoiceLayout>) => onChange({ layout: { ...q.layout, ...patch } });

  const correctCount = q.choices.filter((c) => c.correct).length;
  const showSign = layout.labels === 'sign' || layout.labels === 'both';

  return (
    <div className="space-y-5">
      <ChoiceLayoutControls layout={layout} choiceCount={q.choices.length} onChange={setLayout} />

      <div className="space-y-2.5">
        <p className="text-sm text-slate-500">
          Tap the circle to mark correct answers. Mark more than one to make it a “select all that apply” question.
        </p>
        {q.choices.map((c, i) => (
          <div
            key={c.id}
            className={cn('flex items-center gap-2 rounded-lg border p-1.5 transition-colors', c.correct ? 'border-emerald-500 bg-emerald-50/60' : 'border-slate-200 bg-white')}
          >
            <button
              type="button"
              onClick={() => setChoice(c.id, { correct: !c.correct })}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium transition-colors',
                c.correct ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-400',
              )}
              aria-label={c.correct ? 'Correct answer' : 'Mark as correct'}
              title={c.correct ? 'Correct answer' : 'Mark as correct'}
            >
              {c.correct ? <Check className="h-5 w-5" strokeWidth={3} /> : choiceLetter(i)}
            </button>
            {showSign && (
              <span className="flex h-10 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white" title={`Sign language ${choiceLetter(i)}`}>
                <SignLetter letter={choiceLetter(i)} className="h-8" />
              </span>
            )}
            {layout.labels === 'icons' && <ChoiceIconPicker value={c.icon} index={i} onChange={(icon) => setChoice(c.id, { icon })} />}
            <Input value={c.text} onChange={(e) => setChoice(c.id, { text: e.target.value })} placeholder={`Choice ${choiceLetter(i)}`} className="bg-white" />
            <ImageUpload value={c.image} onChange={(image) => setChoice(c.id, { image })} compact label="Add image to choice" />
            <button
              type="button"
              onClick={() => onChange({ choices: q.choices.filter((x) => x.id !== c.id) })}
              disabled={q.choices.length <= 2}
              className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
              aria-label="Remove choice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {q.choices.length < 10 && (
          <button
            type="button"
            onClick={() => onChange({ choices: [...q.choices, { id: uid(), text: '', image: null, correct: false }] })}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus className="h-4 w-4" /> Add choice
          </button>
        )}
        {correctCount > 1 && (
          <p className="text-xs font-medium text-emerald-700">
            {correctCount} correct answers — participants get partial credit for each one they pick.
          </p>
        )}
      </div>
    </div>
  );
}
