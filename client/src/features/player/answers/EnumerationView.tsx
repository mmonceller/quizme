import { Check } from 'lucide-react';
import type { EnumerationQuestion } from '@shared/types';
import { normalize } from '@shared/grading';
import { AnswerInput } from './AnswerInput';
import { SOLUTION_STYLE, type AnswerViewProps } from './types';

const alts = (a: string) => a.split('|').map((x) => x.trim()).filter(Boolean);

export function EnumerationView({ q, solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<EnumerationQuestion>) {
  const count = q.answers.length;
  const values = Array.isArray(answer) ? answer : [];
  const ordered = (solution ?? q).ordered;

  const setValue = (i: number, v: string) => {
    const next = Array.from({ length: count }, (_, idx) => values[idx] ?? '');
    next[i] = v;
    onChange(next);
  };

  const status = (i: number): 'correct' | 'wrong' | null => {
    if (!solution) return null;
    const v = normalize(values[i] ?? '', solution.caseSensitive);
    if (!v) return 'wrong';
    const pool = ordered ? [solution.answers[i] ?? ''] : solution.answers;
    return pool.some((a) => alts(a).some((x) => normalize(x, solution.caseSensitive) === v)) ? 'correct' : 'wrong';
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <p className="text-center text-sm font-semibold opacity-75">
        List {count} {count === 1 ? 'answer' : 'answers'} {ordered ? 'in the correct order' : 'in any order'}
      </p>
      {interactive || !solution ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-right font-bold opacity-70">{i + 1}.</span>
              {interactive ? (
                <AnswerInput
                  value={values[i] ?? ''}
                  onChange={(v) => setValue(i, v)}
                  theme={theme}
                  disabled={locked}
                  status={status(i)}
                  css={choiceCss}
                  className="w-full py-2"
                />
              ) : (
                <div className="h-11 flex-1 border-b-[3px]" style={{ borderColor: `${theme.accent}66` }} />
              )}
            </div>
          ))}
        </div>
      ) : null}
      {solution && (
        <div className="rounded-2xl p-4" style={SOLUTION_STYLE}>
          <div className="mb-2 text-sm font-semibold opacity-80">Correct answers</div>
          <ol className="grid gap-1.5 sm:grid-cols-2" style={{ ...choiceCss, color: SOLUTION_STYLE.color }}>
            {solution.answers.map((a, i) => (
              <li key={i} className="flex items-center gap-2 font-semibold">
                <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
                {ordered && <span>{i + 1}.</span>}
                {alts(a).join(' / ')}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
