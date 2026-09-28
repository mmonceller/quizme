import type { AnswerMap, GradeResult, Question } from '@shared/types';

export type PlayerMode = 'play' | 'present' | 'public';

export type RevealFn = (question: Question, answer: unknown) => Promise<{ question: Question; result: GradeResult }>;

export interface FinishResult {
  score: number;
  maxScore: number;
  results: Record<string, GradeResult>;
}

export type FinishFn = (answers: AnswerMap, durationSeconds: number) => Promise<FinishResult>;
