import type { WordSearchQuestion } from '../../types.ts';
import { WORD_SEARCH_LIMITS, normalizeWord } from './grid.ts';

export const MAX_WORD_POINTS = 100;

export function cleanWordPoint(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(MAX_WORD_POINTS, Math.max(0, Math.round(n * 100) / 100)) : 1;
}

/** Points for each word, aligned with `words`. */
export function wordPointList(q: Pick<WordSearchQuestion, 'words' | 'wordPoints'>): number[] {
  return q.words.map((_, i) => (q.wordPoints?.[i] === undefined ? 1 : cleanWordPoint(q.wordPoints[i])));
}

/** Points per distinct playable word (the first entry wins for duplicates). */
export function wordPointsByWord(q: Pick<WordSearchQuestion, 'words' | 'wordPoints'>): Map<string, number> {
  const points = wordPointList(q);
  const map = new Map<string, number>();
  q.words.forEach((w, i) => {
    const n = normalizeWord(w);
    if (n.length >= WORD_SEARCH_LIMITS.minWordLength && !map.has(n)) map.set(n, points[i]);
  });
  return map;
}

export function wordSearchTotal(q: Pick<WordSearchQuestion, 'words' | 'wordPoints'>): number {
  const total = [...wordPointsByWord(q).values()].reduce((a, b) => a + b, 0);
  return Math.round(total * 100) / 100;
}
