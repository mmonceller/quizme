import { ArrowDownUp, CheckSquare, Link2, ListOrdered, PenLine, TextCursorInput, ToggleLeft } from 'lucide-react';
import type { QuestionType } from '@shared/types';

export const QUESTION_TYPES: {
  type: QuestionType;
  label: string;
  description: string;
  icon: typeof CheckSquare;
}[] = [
  { type: 'multiple_choice', label: 'Multiple choice', description: 'Pick one or more correct choices', icon: CheckSquare },
  { type: 'true_false', label: 'True or false', description: 'A quick yes-or-no statement', icon: ToggleLeft },
  { type: 'identification', label: 'Identification', description: 'Type the exact answer', icon: PenLine },
  { type: 'fill_blank', label: 'Fill in the blanks', description: 'Complete a sentence', icon: TextCursorInput },
  { type: 'matching', label: 'Matching type', description: 'Pair items from two columns', icon: Link2 },
  { type: 'enumeration', label: 'Enumeration', description: 'List several answers', icon: ListOrdered },
  { type: 'sequencing', label: 'Sequencing', description: 'Arrange items in order', icon: ArrowDownUp },
];

export const typeMeta = (type: QuestionType) => QUESTION_TYPES.find((t) => t.type === type)!;
