import type { SequencingQuestion } from '@shared/types';
import { uid } from '@/lib/utils';
import { EditableList } from '../components/EditableList';
import type { TypeEditorProps } from './types';

export function SequencingEditor({ q, onChange }: TypeEditorProps<SequencingQuestion>) {
  return (
    <div>
      <p className="mb-2 text-sm text-slate-500">Enter the items in the correct order. They will be shuffled for participants.</p>
      <EditableList
        items={q.items}
        onChange={(items) => onChange({ items })}
        getText={(i) => i.text}
        setText={(i, text) => ({ ...i, text })}
        create={() => ({ id: uid(), text: '' })}
        placeholder={(i) => (i === 0 ? 'First' : `Step ${i + 1}`)}
        addLabel="Add item"
        numbered
        reorderable
        min={2}
      />
    </div>
  );
}
