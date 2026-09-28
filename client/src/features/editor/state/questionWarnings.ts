import type { Question } from '@shared/types';
import { countBlanks } from '@shared/blanks';

/** Returns a friendly hint when a question isn't ready to be played yet. */
export function questionWarning(q: Question): string | null {
  if (!q.prompt.trim() && q.type !== 'fill_blank') return 'Add the question text';
  switch (q.type) {
    case 'multiple_choice':
      if (q.choices.filter((c) => c.text.trim() || c.image).length < 2) return 'Add at least two choices';
      if (!q.choices.some((c) => c.correct)) return 'Mark the correct answer';
      if (q.choices.some((c) => c.correct && !c.text.trim() && !c.image)) return 'A correct choice is empty';
      return null;
    case 'identification':
      return q.answers.some((a) => a.trim()) ? null : 'Add the correct answer';
    case 'fill_blank':
      return countBlanks(q.text) > 0 ? null : 'Add at least one blank using [[answer]]';
    case 'matching':
      if (q.pairs.length < 2) return 'Add at least two pairs';
      return q.pairs.every((p) => p.left.trim() && p.right.trim()) ? null : 'Fill in both sides of every pair';
    case 'enumeration':
      return q.answers.length && q.answers.every((a) => a.trim()) ? null : 'Fill in every answer';
    case 'sequencing':
      if (q.items.length < 2) return 'Add at least two items';
      return q.items.every((i) => i.text.trim()) ? null : 'Fill in every item';
    default:
      return null;
  }
}
