import type { Question } from '@shared/types';
import { MultipleChoiceEditor } from './MultipleChoiceEditor';
import { TrueFalseEditor } from './TrueFalseEditor';
import { IdentificationEditor } from './IdentificationEditor';
import { FillBlankEditor } from './FillBlankEditor';
import { MatchingEditor } from './MatchingEditor';
import { EnumerationEditor } from './EnumerationEditor';
import { SequencingEditor } from './SequencingEditor';

export function TypeEditor({ q, onChange }: { q: Question; onChange: (patch: Partial<Question>) => void }) {
  switch (q.type) {
    case 'multiple_choice':
      return <MultipleChoiceEditor q={q} onChange={onChange} />;
    case 'true_false':
      return <TrueFalseEditor q={q} onChange={onChange} />;
    case 'identification':
      return <IdentificationEditor q={q} onChange={onChange} />;
    case 'fill_blank':
      return <FillBlankEditor q={q} onChange={onChange} />;
    case 'matching':
      return <MatchingEditor q={q} onChange={onChange} />;
    case 'enumeration':
      return <EnumerationEditor q={q} onChange={onChange} />;
    case 'sequencing':
      return <SequencingEditor q={q} onChange={onChange} />;
  }
}
