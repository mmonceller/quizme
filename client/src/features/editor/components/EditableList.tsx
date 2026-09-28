import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { moveItem } from '@/lib/utils';

/** Editable list of text rows with add, remove and optional reordering. */
export function EditableList<T>({
  items,
  onChange,
  getText,
  setText,
  create,
  placeholder,
  addLabel,
  numbered,
  reorderable,
  min = 1,
  prefix,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  getText: (item: T) => string;
  setText: (item: T, text: string) => T;
  create: () => T;
  placeholder: (index: number) => string;
  addLabel: string;
  numbered?: boolean;
  reorderable?: boolean;
  min?: number;
  prefix?: (index: number) => ReactNode;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {prefix?.(i)}
          {numbered && <span className="w-6 shrink-0 text-right text-sm font-semibold text-slate-400">{i + 1}.</span>}
          <Input
            value={getText(item)}
            onChange={(e) => onChange(items.map((it, idx) => (idx === i ? setText(it, e.target.value) : it)))}
            placeholder={placeholder(i)}
          />
          {reorderable && (
            <div className="flex shrink-0">
              <button type="button" onClick={() => onChange(moveItem(items, i, i - 1))} disabled={i === 0} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onChange(moveItem(items, i, i + 1))} disabled={i === items.length - 1} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30" aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            disabled={items.length <= min}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, create()])}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
