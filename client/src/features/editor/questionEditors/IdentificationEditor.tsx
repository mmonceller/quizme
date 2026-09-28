import type { IdentificationQuestion } from '@shared/types';
import { Toggle } from '@/components/ui';
import { EditableList } from '../components/EditableList';
import type { TypeEditorProps } from './types';

export function IdentificationEditor({ q, onChange }: TypeEditorProps<IdentificationQuestion>) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-slate-500">
          Correct answer. Add alternatives if more than one spelling should count (e.g. “USA” and “United States”).
        </p>
        <EditableList
          items={q.answers}
          onChange={(answers) => onChange({ answers })}
          getText={(a) => a}
          setText={(_, t) => t}
          create={() => ''}
          placeholder={(i) => (i === 0 ? 'Correct answer' : 'Also accept…')}
          addLabel="Add accepted alternative"
        />
      </div>
      <Toggle checked={q.caseSensitive} onChange={(caseSensitive) => onChange({ caseSensitive })} label="Case sensitive" description="When off, “Paris” and “paris” are both correct." />
    </div>
  );
}
