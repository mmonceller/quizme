import type { Question } from '@shared/types';

export interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onAdd: () => void;
}
