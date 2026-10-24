import { Dices, MousePointerClick } from 'lucide-react';
import type { MazeAnchor } from '@shared/types';
import { cn } from '@/lib/utils';

const GRID: MazeAnchor[] = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

const LABELS: Record<MazeAnchor, string> = {
  'top-left': 'Top left',
  top: 'Top',
  'top-right': 'Top right',
  left: 'Left',
  center: 'Center',
  right: 'Right',
  'bottom-left': 'Bottom left',
  bottom: 'Bottom',
  'bottom-right': 'Bottom right',
  random: 'Random',
  custom: 'Picked on the maze',
};

/** 3 × 3 position pad plus "random"; "custom" is set by clicking the maze preview. */
export function AnchorPicker({
  value,
  onChange,
  color,
  picking,
  onPick,
}: {
  value: MazeAnchor;
  onChange: (anchor: MazeAnchor) => void;
  color: string;
  picking: boolean;
  onPick: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {GRID.map((a) => (
          <button
            key={a}
            type="button"
            title={LABELS[a]}
            aria-label={LABELS[a]}
            aria-pressed={value === a}
            onClick={() => onChange(a)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100"
          >
            <span className={cn('rounded-full transition-all', value === a ? 'h-3.5 w-3.5' : 'h-2 w-2 bg-slate-300')} style={value === a ? { background: color } : undefined} />
          </button>
        ))}
      </div>
      <div className="flex flex-col items-start gap-1">
        <span className="text-[13px] font-medium text-slate-700">{LABELS[value]}</span>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => onChange('random')}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
              value === 'random' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-500 hover:text-slate-800',
            )}
          >
            <Dices className="h-3.5 w-3.5" /> Random
          </button>
          <button
            type="button"
            onClick={onPick}
            className={cn(
              'flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium',
              picking ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-500 hover:text-slate-800',
            )}
          >
            <MousePointerClick className="h-3.5 w-3.5" /> {picking ? 'Click a cell below…' : 'Pick on maze'}
          </button>
        </div>
      </div>
    </div>
  );
}
