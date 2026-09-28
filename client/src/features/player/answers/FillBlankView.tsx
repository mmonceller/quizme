import { Fragment, useState, type ReactNode } from 'react';
import type { FillBlankQuestion, Theme } from '@shared/types';
import { blankSizerText, isMaskedBlank, parseBlanks } from '@shared/blanks';
import { normalize } from '@shared/grading';
import { cn } from '@/lib/utils';
import { CORRECT, SOLUTION_STYLE, WRONG, type AnswerViewProps } from './types';

export function FillBlankView({ q, solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<FillBlankQuestion>) {
  const segments = parseBlanks(q.text);
  const solutionBlanks = solution ? parseBlanks(solution.text).filter((s) => s.kind === 'blank') : [];
  const values = Array.isArray(answer) ? answer : [];
  const blankCount = segments.filter((s) => s.kind === 'blank').length;
  const [shown, setShown] = useState<Set<number>>(() => new Set());

  const setValue = (i: number, v: string) => {
    const next = Array.from({ length: blankCount }, (_, idx) => values[idx] ?? '');
    next[i] = v;
    onChange(next);
  };

  const answersFor = (i: number, own: string[]) => {
    const sol = solutionBlanks[i];
    if (sol?.kind === 'blank') return sol.answers;
    return isMaskedBlank(own) ? [] : own;
  };

  const isCorrect = (i: number) => {
    if (!solution) return false;
    return answersFor(i, []).some((a) => normalize(a, solution.caseSensitive) === normalize(values[i] ?? '', solution.caseSensitive));
  };

  const toggle = (i: number) =>
    setShown((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const revealable = !interactive && !solution && segments.some((s) => s.kind === 'blank' && !isMaskedBlank(s.answers));
  const allShown = shown.size >= blankCount;

  return (
    <div>
      <div className="rounded-3xl p-[0.9em] sm:p-[1.2em]" style={{ background: theme.choiceBg, color: theme.choiceText, ...choiceCss, lineHeight: 2.4 }}>
        {segments.map((s, idx) => {
          if (s.kind === 'text') return <Fragment key={idx}>{s.value}</Fragment>;
          const answers = answersFor(s.index, s.answers);
          const sizer = blankSizerText(s.answers);

          if (!interactive) {
            const open = !!solution || shown.has(s.index);
            return (
              <Blank key={idx} sizer={sizer} theme={theme} status={open && answers.length ? 'answer' : null}>
                <button
                  type="button"
                  onClick={() => !solution && answers.length && toggle(s.index)}
                  disabled={!!solution || !answers.length}
                  className={cn('col-start-1 row-start-1 w-full px-[0.35em] text-center font-bold', !solution && answers.length && 'cursor-pointer hover:opacity-80')}
                  style={{ color: open ? CORRECT : 'transparent' }}
                  title={open ? undefined : 'Show answer'}
                  aria-label={open ? answers[0] : `Show answer for blank ${s.index + 1}`}
                >
                  {open ? answers[0] : sizer}
                </button>
              </Blank>
            );
          }

          const value = values[s.index] ?? '';
          const status = solution ? (isCorrect(s.index) ? 'correct' : 'wrong') : null;
          return (
            <Blank
              key={idx}
              sizer={value.length > sizer.length ? value : sizer}
              theme={theme}
              status={status}
              below={status === 'wrong' && answers[0] ? answers[0] : undefined}
            >
              <input
                value={value}
                onChange={(e) => setValue(s.index, e.target.value)}
                disabled={locked}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                size={1}
                aria-label={`Blank ${s.index + 1}`}
                className="col-start-1 row-start-1 w-full min-w-0 bg-transparent px-[0.35em] text-center font-semibold outline-none"
                style={{ color: 'inherit', font: 'inherit', lineHeight: 1.4 }}
              />
            </Blank>
          );
        })}
      </div>
      {revealable && (
        <div className="mt-3 flex items-center justify-center gap-3 text-sm opacity-70">
          <span>Tap a blank to reveal its answer</span>
          {shown.size > 0 && (
            <button type="button" onClick={() => setShown(allShown ? new Set() : new Set(Array.from({ length: blankCount }, (_, i) => i)))} className="font-semibold underline underline-offset-2">
              {allShown ? 'Hide all' : 'Show all'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Inline blank whose width comes from an invisible copy of `sizer` rendered in the
 * surrounding font, so the line length tracks the answer at any font size or style.
 */
function Blank({
  sizer,
  theme,
  status,
  below,
  children,
}: {
  sizer: string;
  theme: Theme;
  status: 'correct' | 'wrong' | 'answer' | null;
  below?: string;
  children: ReactNode;
}) {
  const line = status === 'correct' || status === 'answer' ? CORRECT : status === 'wrong' ? WRONG : theme.accent;
  return (
    <span className="relative mx-[0.15em] inline-grid align-baseline leading-[1.4]">
      <span
        className="col-start-1 row-start-1 rounded-t-[0.3em] border-b-[3px]"
        style={{ borderColor: line, background: status === 'answer' ? `${CORRECT}14` : `${theme.accent}10` }}
        aria-hidden
      />
      <span aria-hidden className="invisible col-start-1 row-start-1 min-w-[2.5ch] px-[0.35em] font-bold whitespace-pre">
        {sizer}
        {'\u2009'}
      </span>
      {children}
      {below && (
        <span className="absolute top-full left-1/2 mt-0.5 -translate-x-1/2 rounded-md px-1.5 text-[0.6em] leading-snug font-bold whitespace-nowrap" style={SOLUTION_STYLE}>
          {below}
        </span>
      )}
    </span>
  );
}
