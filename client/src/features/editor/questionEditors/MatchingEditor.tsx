import { ArrowRight, Plus, X } from 'lucide-react';
import type { MatchingQuestion } from '@shared/types';
import { Input } from '@/components/ui';
import { uid } from '@/lib/utils';
import type { TypeEditorProps } from './types';

export function MatchingEditor({ q, onChange }: TypeEditorProps<MatchingQuestion>) {
  const setPair = (id: string, patch: Partial<MatchingQuestion['pairs'][number]>) =>
    onChange({ pairs: q.pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)) });

  return (
    <div className="space-y-2.5">
      <p className="text-sm text-slate-500">Enter matching pairs. The right-hand answers get shuffled for participants.</p>
      {q.pairs.map((p, i) => (
        <div key={p.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2">
          <span className="w-6 shrink-0 text-center text-sm font-semibold text-slate-400">{i + 1}</span>
          <Input value={p.left} onChange={(e) => setPair(p.id, { left: e.target.value })} placeholder="Item" className="bg-white" />
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
          <Input value={p.right} onChange={(e) => setPair(p.id, { right: e.target.value })} placeholder="Its match" className="bg-white" />
          <button
            type="button"
            onClick={() => onChange({ pairs: q.pairs.filter((x) => x.id !== p.id) })}
            disabled={q.pairs.length <= 2}
            className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
            aria-label="Remove pair"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ pairs: [...q.pairs, { id: uid(), left: '', right: '' }] })}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50"
      >
        <Plus className="h-4 w-4" /> Add pair
      </button>
    </div>
  );
}
