import type { TrueFalseQuestion } from '@shared/types';
import { cn } from '@/lib/utils';
import { IconCheck, IconClose } from '@/components/icons';
import type { TypeEditorProps } from './types';

export function TrueFalseEditor({ q, onChange }: TypeEditorProps<TrueFalseQuestion>) {
  return (
    <div>
      <p className="mb-3 text-sm text-slate-500">Which is the correct answer?</p>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => {
          const Icon = v ? IconCheck : IconClose;
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => onChange({ answer: v })}
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border px-4 py-3.5 text-[15px] font-medium transition-colors',
                q.answer === v
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50',
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
              {v ? 'True' : 'False'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
