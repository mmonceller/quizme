import type { AnswerMap, Question, QuizSettings } from '@shared/types';
import { shuffle } from '@/lib/utils';

function shuffleAway<T extends { id: string }>(items: T[]): T[] {
  if (items.length < 2) return items;
  for (let i = 0; i < 5; i++) {
    const s = shuffle(items);
    if (s.some((item, idx) => item.id !== items[idx].id)) return s;
  }
  return [...items].reverse();
}

/**
 * Produces the display order for a play session. `sanitized` payloads (public links)
 * arrive with sequencing items and matching options already shuffled by the server.
 */
export function prepareQuestions(questions: Question[], settings: QuizSettings, sanitized: boolean): Question[] {
  const ordered = settings.shuffleQuestions ? shuffle(questions) : [...questions];
  return ordered.map((q) => {
    switch (q.type) {
      case 'multiple_choice':
        return settings.shuffleChoices ? { ...q, choices: shuffle(q.choices) } : q;
      case 'matching':
        return q.options ? q : { ...q, options: shuffle(q.pairs.map((p) => p.right)) };
      case 'sequencing':
        return sanitized ? q : { ...q, items: shuffleAway(q.items) };
      default:
        return q;
    }
  });
}

export function initialAnswers(questions: Question[]): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of questions) {
    if (q.type === 'sequencing') answers[q.id] = q.items.map((i) => i.id);
  }
  return answers;
}
