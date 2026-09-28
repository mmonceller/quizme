import { Fragment, useRef } from 'react';
import { Plus } from 'lucide-react';
import type { FillBlankQuestion } from '@shared/types';
import { parseBlanks } from '@shared/blanks';
import { Button, Textarea, Toggle } from '@/components/ui';
import type { TypeEditorProps } from './types';

export function FillBlankEditor({ q, onChange }: TypeEditorProps<FillBlankQuestion>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const segments = parseBlanks(q.text);

  /** Wraps the selected text as a blank, or inserts a placeholder blank at the cursor. */
  const insertBlank = () => {
    const el = ref.current;
    const start = el?.selectionStart ?? q.text.length;
    const end = el?.selectionEnd ?? q.text.length;
    const selected = q.text.slice(start, end).trim() || 'answer';
    const next = `${q.text.slice(0, start)}[[${selected}]]${q.text.slice(end)}`;
    onChange({ text: next });
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + selected.length + 4;
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            Write the sentence and put answers in double brackets: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">The sky is [[blue]].</code>{' '}
            Use <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">|</code> for alternatives: <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">[[grey|gray]]</code>
          </p>
          <Button size="sm" variant="soft" onClick={insertBlank} icon={<Plus className="h-4 w-4" />}>
            Make blank
          </Button>
        </div>
        <Textarea
          ref={ref}
          value={q.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="The [[sun]] rises in the [[east]]."
          className="min-h-[110px] font-mono text-sm"
        />
        <p className="mt-1 text-xs text-slate-400">Tip: select a word, then tap “Make blank”.</p>
      </div>
      {segments.some((s) => s.kind === 'blank') && (
        <div className="rounded-xl bg-slate-50 p-4 leading-9">
          <div className="mb-1 text-xs font-semibold tracking-wide text-slate-400 uppercase">Participants will see</div>
          {segments.map((s, i) =>
            s.kind === 'text' ? (
              <Fragment key={i}>{s.value}</Fragment>
            ) : (
              <span key={i} className="mx-1 inline-block min-w-16 rounded-md border border-dashed border-brand-400 bg-white px-2 text-center text-sm leading-7 font-medium text-brand-700">
                {s.answers.join(' / ') || '?'}
              </span>
            ),
          )}
        </div>
      )}
      <Toggle checked={q.caseSensitive} onChange={(caseSensitive) => onChange({ caseSensitive })} label="Case sensitive" />
    </div>
  );
}
