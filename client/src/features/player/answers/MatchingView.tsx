import { ArrowRight, Check, X } from 'lucide-react';
import type { MatchingQuestion } from '@shared/types';
import { ThemedSelect, type SelectOption } from './ThemedSelect';
import { CORRECT, SOLUTION_STYLE, WRONG, type AnswerViewProps } from './types';

export function MatchingView({ q, solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<MatchingQuestion>) {
  const picks = answer && typeof answer === 'object' && !Array.isArray(answer) ? (answer as Record<string, string>) : {};
  const options = q.options ?? q.pairs.map((p) => p.right);
  const correctRight = (pairId: string) => solution?.pairs.find((p) => p.id === pairId)?.right ?? '';

  /** Options not yet used by another row (duplicates are counted, so repeated answers stay pickable). */
  const availableFor = (pairId: string): SelectOption[] => {
    const used = new Map<string, number>();
    for (const [id, v] of Object.entries(picks)) if (id !== pairId && v) used.set(v, (used.get(v) ?? 0) + 1);
    const result: SelectOption[] = [];
    options.forEach((o, i) => {
      const n = used.get(o) ?? 0;
      if (n > 0) used.set(o, n - 1);
      else if (!result.some((r) => r.value === o)) result.push({ value: o, label: o, tag: String.fromCharCode(65 + i) });
    });
    return result;
  };

  if (!interactive) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          {q.pairs.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: theme.choiceBg, color: theme.choiceText, ...choiceCss }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold" style={{ background: `${theme.accent}22`, color: theme.accent }}>
                {i + 1}
              </span>
              <span className="flex-1">{p.left}</span>
              {solution && (
                <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 font-bold" style={SOLUTION_STYLE}>
                  <ArrowRight className="h-4 w-4" />
                  {String.fromCharCode(65 + options.indexOf(correctRight(p.id)))}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {options.map((o, i) => (
            <div key={`${o}-${i}`} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: theme.choiceBg, color: theme.choiceText, ...choiceCss }}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold" style={{ background: theme.accent, color: '#fff' }}>
                {String.fromCharCode(65 + i)}
              </span>
              {o}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {q.pairs.map((p) => {
        const value = picks[p.id] ?? '';
        const ok = solution ? value === correctRight(p.id) : null;
        return (
          <div
            key={p.id}
            className="grid items-center gap-2 rounded-2xl border-[3px] p-2.5 sm:grid-cols-[1fr_auto_1fr] sm:gap-3"
            style={{
              background: theme.choiceBg,
              color: theme.choiceText,
              borderColor: ok === null ? 'transparent' : ok ? CORRECT : WRONG,
              ...choiceCss,
            }}
          >
            <div className="px-2 font-semibold">{p.left}</div>
            <ArrowRight className="hidden h-5 w-5 opacity-50 sm:block" />
            <div className="flex min-w-0 items-center gap-2">
              <ThemedSelect
                value={value}
                options={availableFor(p.id)}
                onChange={(v) => onChange({ ...picks, [p.id]: v })}
                theme={theme}
                disabled={locked}
                status={ok === null ? null : ok ? 'correct' : 'wrong'}
                ariaLabel={`Match for ${p.left}`}
              />
              {ok === true && <Check className="h-6 w-6 shrink-0" style={{ color: CORRECT }} strokeWidth={3} />}
              {ok === false && <X className="h-6 w-6 shrink-0" style={{ color: WRONG }} strokeWidth={3} />}
            </div>
            {ok === false && (
              <div className="sm:col-span-3 sm:text-right">
                <span className="inline-block rounded-lg px-2.5 py-1 text-sm font-bold" style={SOLUTION_STYLE}>
                  Correct: {correctRight(p.id)}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
