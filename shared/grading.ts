import { parseBlanks } from './blanks.ts';
import { isSolved } from './puzzles/maze/index.ts';
import { WORD_SEARCH_LIMITS, foundWords, normalizeWord } from './puzzles/wordSearch/index.ts';
import type { Answer, AnswerMap, GradeResult, Question } from './types.ts';

const strings = (answer: Answer): string[] =>
  Array.isArray(answer) ? answer.filter((a): a is string => typeof a === 'string') : [];

export function normalize(value: string, caseSensitive = false): string {
  const collapsed = value.trim().replace(/\s+/g, ' ');
  return caseSensitive ? collapsed : collapsed.toLowerCase();
}

function matchesAny(value: string, accepted: string[], caseSensitive: boolean): boolean {
  const v = normalize(value, caseSensitive);
  return v.length > 0 && accepted.some((a) => normalize(a, caseSensitive) === v);
}

/** Enumeration answers may list alternates with "|" (e.g. "USA|United States"). */
function alternates(answer: string): string[] {
  return answer.split('|').map((a) => a.trim()).filter(Boolean);
}

function fraction(q: Question, answer: Answer): number {
  switch (q.type) {
    case 'multiple_choice': {
      const picked = new Set(strings(answer));
      const correct = q.choices.filter((c) => c.correct).map((c) => c.id);
      if (correct.length === 0) return 0;
      if (correct.length === 1) return picked.size === 1 && picked.has(correct[0]) ? 1 : 0;
      const hits = correct.filter((id) => picked.has(id)).length;
      const wrong = [...picked].filter((id) => !correct.includes(id)).length;
      return Math.max(0, (hits - wrong) / correct.length);
    }
    case 'true_false':
      return typeof answer === 'boolean' && answer === q.answer ? 1 : 0;
    case 'identification':
      return typeof answer === 'string' && matchesAny(answer, q.answers, q.caseSensitive) ? 1 : 0;
    case 'fill_blank': {
      const blanks = parseBlanks(q.text).filter((s) => s.kind === 'blank');
      if (blanks.length === 0) return 0;
      const given = strings(answer);
      const hits = blanks.filter(
        (b, i) => b.kind === 'blank' && matchesAny(given[i] ?? '', b.answers, q.caseSensitive),
      ).length;
      return hits / blanks.length;
    }
    case 'matching': {
      if (q.pairs.length === 0) return 0;
      const given = answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
      const hits = q.pairs.filter(
        (p) => given[p.id] !== undefined && normalize(given[p.id], true) === normalize(p.right, true),
      ).length;
      return hits / q.pairs.length;
    }
    case 'enumeration': {
      if (q.answers.length === 0) return 0;
      const given = strings(answer).map((a) => normalize(a, q.caseSensitive));
      if (q.ordered) {
        const hits = q.answers.filter((a, i) => matchesAny(given[i] ?? '', alternates(a), q.caseSensitive)).length;
        return hits / q.answers.length;
      }
      const remaining = q.answers.map(alternates);
      let hits = 0;
      for (const g of given) {
        if (!g) continue;
        const idx = remaining.findIndex((alts) => matchesAny(g, alts, q.caseSensitive));
        if (idx >= 0) {
          hits++;
          remaining.splice(idx, 1);
        }
      }
      return hits / q.answers.length;
    }
    case 'sequencing': {
      if (q.items.length === 0) return 0;
      const given = strings(answer);
      const hits = q.items.filter((item, i) => given[i] === item.id).length;
      return hits / q.items.length;
    }
    case 'word_search': {
      const words = new Set(q.words.map(normalizeWord).filter((w) => w.length >= WORD_SEARCH_LIMITS.minWordLength));
      const found = new Set([...foundWords(q, answer).keys()].map((i) => normalizeWord(q.words[i])));
      return words.size === 0 ? 0 : found.size / words.size;
    }
    case 'maze':
      return isSolved(q, answer) ? 1 : 0;
  }
}

export function gradeQuestion(q: Question, answer: Answer | undefined): GradeResult {
  const max = q.points;
  const f = answer === undefined || answer === null ? 0 : fraction(q, answer);
  const earned = Math.round(f * max * 100) / 100;
  return { earned, max, correct: f >= 0.999 };
}

export function gradeQuiz(questions: Question[], answers: AnswerMap) {
  const results: Record<string, GradeResult> = {};
  let score = 0;
  let maxScore = 0;
  for (const q of questions) {
    const r = gradeQuestion(q, answers[q.id]);
    results[q.id] = r;
    score += r.earned;
    maxScore += r.max;
  }
  return { results, score: Math.round(score * 100) / 100, maxScore };
}
