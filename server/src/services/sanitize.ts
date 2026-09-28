import { hideBlankAnswers } from '../../../shared/blanks.ts';
import type { Question } from '../../../shared/types.ts';

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Removes everything that would reveal the correct answer before a participant responds. */
export function stripAnswers(q: Question): Question {
  switch (q.type) {
    case 'multiple_choice': {
      const correctCount = q.choices.filter((c) => c.correct).length;
      return { ...q, multiSelect: correctCount > 1, choices: q.choices.map((c) => ({ ...c, correct: false })) };
    }
    case 'true_false':
      return { ...q, answer: false };
    case 'identification':
      return { ...q, answers: [] };
    case 'fill_blank':
      return { ...q, text: hideBlankAnswers(q.text) };
    case 'matching':
      return {
        ...q,
        options: shuffle(q.pairs.map((p) => p.right)),
        pairs: q.pairs.map((p) => ({ ...p, right: '' })),
      };
    case 'enumeration':
      return { ...q, answers: q.answers.map(() => '') };
    case 'sequencing':
      return { ...q, items: shuffle(q.items) };
  }
}