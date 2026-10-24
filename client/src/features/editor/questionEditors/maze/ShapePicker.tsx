import { useMemo } from 'react';
import { shapeMask } from '@shared/puzzles/maze';
import type { MazeShape } from '@shared/types';
import { cn } from '@/lib/utils';

const SHAPES: { value: MazeShape; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rectangle', label: 'Wide' },
  { value: 'circle', label: 'Circle' },
  { value: 'ring', label: 'Ring' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'heart', label: 'Heart' },
];

function ShapeIcon({ shape }: { shape: MazeShape }) {
  const rows = 10;
  const cols = shape === 'rectangle' ? 15 : 10;
  const d = useMemo(
    () =>
      shapeMask(shape, rows, cols)
        .flatMap((row, r) => row.map((on, c) => (on ? `M${c} ${r}h1v1h-1z` : '')))
        .join(''),
    [shape, cols],
  );
  return (
    <svg viewBox={`0 0 ${cols} ${rows}`} className="h-7 w-10" aria-hidden>
      <path d={d} fill="currentColor" stroke="currentColor" strokeWidth={0.1} />
    </svg>
  );
}

export function ShapePicker({ value, onChange }: { value: MazeShape; onChange: (shape: MazeShape) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
      {SHAPES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          aria-pressed={value === s.value}
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[11px] font-medium transition-colors',
            value === s.value ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700',
          )}
        >
          <ShapeIcon shape={s.value} />
          <span className={value === s.value ? 'text-brand-800' : 'text-slate-600'}>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
