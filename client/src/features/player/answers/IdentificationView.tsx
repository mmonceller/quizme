import type { IdentificationQuestion } from '@shared/types';
import { gradeQuestion } from '@shared/grading';
import { AnswerInput } from './AnswerInput';
import { SOLUTION_STYLE, type AnswerViewProps } from './types';

export function IdentificationView({ solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<IdentificationQuestion>) {
  const value = typeof answer === 'string' ? answer : '';
  const correct = solution ? gradeQuestion(solution, value).correct : null;

  return (
    <div className="mx-auto w-full max-w-xl space-y-3">
      {interactive ? (
        <AnswerInput
          value={value}
          onChange={onChange}
          theme={theme}
          disabled={locked}
          status={correct === null ? null : correct ? 'correct' : 'wrong'}
          placeholder="Type your answer…"
          css={choiceCss}
          className="w-full"
          autoFocus
        />
      ) : (
        !solution && (
          <div className="rounded-2xl border-[3px] border-dashed px-4 py-5 text-center opacity-70" style={{ borderColor: `${theme.accent}66` }}>
            Write your answer
          </div>
        )
      )}
      {solution && (
        <div className="rounded-2xl px-4 py-3 text-center" style={{ ...choiceCss, ...SOLUTION_STYLE, textAlign: 'center' }}>
          <span className="text-sm font-semibold opacity-80">Correct answer: </span>
          <strong>{solution.answers.join(' / ')}</strong>
        </div>
      )}
    </div>
  );
}
