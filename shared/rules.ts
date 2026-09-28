import type { Question, QuizSettings } from './types.ts';

export function shouldReveal(q: Question, settings: QuizSettings): boolean {
  if (q.revealAnswer === 'show') return true;
  if (q.revealAnswer === 'hide') return false;
  return settings.revealAnswers;
}

/** Seconds allowed for a question, or 0 when it is untimed. */
export function effectiveSeconds(q: Question, settings: QuizSettings): number {
  if (!settings.timer.enabled) return 0;
  if (q.timerSeconds === null || q.timerSeconds === undefined) return settings.timer.defaultSeconds;
  return q.timerSeconds;
}
