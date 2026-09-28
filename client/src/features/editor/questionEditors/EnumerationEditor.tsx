import type { EnumerationQuestion } from '@shared/types';
import { Toggle } from '@/components/ui';
import { EditableList } from '../components/EditableList';
import type { TypeEditorProps } from './types';

export function EnumerationEditor({ q, onChange }: TypeEditorProps<EnumerationQuestion>) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-slate-500">
          List every expected answer. Participants get one box per answer. Use <code className="rounded bg-slate-100 px-1">|</code> for alternatives, e.g. “Earth|The Earth”.
        </p>
        <EditableList
          items={q.answers}
          onChange={(answers) => onChange({ answers })}
          getText={(a) => a}
          setText={(_, t) => t}
          create={() => ''}
          placeholder={(i) => `Answer ${i + 1}`}
          addLabel="Add answer"
          numbered
          reorderable={q.ordered}
        />
      </div>
      <Toggle checked={q.ordered} onChange={(ordered) => onChange({ ordered })} label="Order matters" description="When on, answers must be listed in this exact order." />
      <Toggle checked={q.caseSensitive} onChange={(caseSensitive) => onChange({ caseSensitive })} label="Case sensitive" />
    </div>
  );
}
