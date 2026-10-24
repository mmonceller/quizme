import type { CSSProperties } from 'react';
import type { Answer, Question, Theme } from '@shared/types';

export interface AnswerViewProps<Q extends Question = Question> {
  /** Question as displayed (may be shuffled or have answers stripped). */
  q: Q;
  /** Full question with correct answers; present once the answer is revealed. */
  solution: Q | null;
  answer: Answer | undefined;
  onChange: (answer: Answer) => void;
  /** Accepts input from the participant (false in presentation mode). */
  interactive: boolean;
  locked: boolean;
  theme: Theme;
  choiceCss: CSSProperties;
}

/** The answer as a list of strings (choice ids, typed values, item ids). */
export const stringList = (answer: Answer | undefined): string[] =>
  Array.isArray(answer) ? answer.filter((a): a is string => typeof a === 'string') : [];

export const CORRECT = '#16a34a';
export const WRONG = '#dc2626';
/** Readable on any theme background. */
export const SOLUTION_STYLE = { background: '#dcfce7', color: '#166534' } as const;
