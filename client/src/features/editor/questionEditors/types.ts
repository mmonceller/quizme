import type { Question } from '@shared/types';

export interface TypeEditorProps<Q extends Question> {
  q: Q;
  onChange: (patch: Partial<Q>) => void;
}
