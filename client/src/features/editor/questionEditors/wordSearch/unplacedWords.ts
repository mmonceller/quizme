import { WORD_SEARCH_LIMITS, normalizeWord } from '@shared/puzzles/wordSearch';
import type { WordSearchQuestion } from '@shared/types';

/** Valid words that are missing from the generated grid. */
export function unplacedWords(q: Pick<WordSearchQuestion, 'words' | 'placements'>): string[] {
  const placed = new Set(q.placements.map((p) => normalizeWord(p.word)));
  const seen = new Set<string>();
  return q.words.filter((w) => {
    const n = normalizeWord(w);
    if (n.length < WORD_SEARCH_LIMITS.minWordLength || seen.has(n)) return false;
    seen.add(n);
    return !placed.has(n);
  });
}
