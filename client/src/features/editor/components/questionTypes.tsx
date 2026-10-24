import { ArrowDownUp, CheckSquare, Grid3x3, Link2, ListOrdered, PenLine, Route, TextCursorInput, ToggleLeft } from 'lucide-react';
import type { QuestionType } from '@shared/types';

export type QuestionGroup = 'standard' | 'puzzle';

export const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  description: string;
  icon: typeof CheckSquare;
  group: QuestionGroup;
}[] = [
  { type: 'multiple_choice', label: 'Multiple choice', description: 'Pick one or more correct choices', icon: CheckSquare, group: 'standard' },
  { type: 'true_false', label: 'True or false', description: 'A quick yes-or-no statement', icon: ToggleLeft, group: 'standard' },
  { type: 'identification', label: 'Identification', description: 'Type the exact answer', icon: PenLine, group: 'standard' },
  { type: 'fill_blank', label: 'Fill in the blanks', description: 'Complete a sentence', icon: TextCursorInput, group: 'standard' },
  { type: 'matching', label: 'Matching type', description: 'Pair items from two columns', icon: Link2, group: 'standard' },
  { type: 'enumeration', label: 'Enumeration', description: 'List several answers', icon: ListOrdered, group: 'standard' },
  { type: 'sequencing', label: 'Sequencing', description: 'Arrange items in order', icon: ArrowDownUp, group: 'standard' },
  { type: 'word_search', label: 'Word search', description: 'Find hidden words in a letter grid', icon: Grid3x3, group: 'puzzle' },
  { type: 'maze', label: 'Maze', description: 'Trace a path from start to finish', icon: Route, group: 'puzzle' },
];

export const QUESTION_GROUPS: { group: QuestionGroup; label: string }[] = [
  { group: 'standard', label: 'Questions' },
  { group: 'puzzle', label: 'Puzzles' },
];

export const typeMeta = (type: QuestionType) => QUESTION_TYPES.find((t) => t.type === type)!;
