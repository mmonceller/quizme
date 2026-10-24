import { useMemo, useState } from 'react';
import { Eye, EyeOff, Shuffle } from 'lucide-react';
import { generateMaze, solveMaze } from '@shared/puzzles/maze';
import { randomSeed } from '@shared/puzzles/random';
import type { Cell, MazeOptions, MazeQuestion, MazeSize } from '@shared/types';
import { Button, Segmented } from '@/components/ui';
import { MazeBoard } from '@/components/puzzles/maze';
import { SettingRow } from '../../components/SettingRow';
import type { TypeEditorProps } from '../types';
import { AnchorPicker } from './AnchorPicker';
import { ShapePicker } from './ShapePicker';

const SIZES: { value: MazeSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

const START_COLOR = '#16a34a';
const END_COLOR = '#dc2626';

interface MazeInput {
  options?: Partial<MazeOptions>;
  seed?: number;
  start?: Cell;
  end?: Cell;
}

export function MazeEditor({ q, onChange }: TypeEditorProps<MazeQuestion>) {
  const [picking, setPicking] = useState<'start' | 'end' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const solution = useMemo(() => (showSolution ? solveMaze(q) : null), [showSolution, q]);

  const update = (patch: MazeInput) => {
    const options = { ...q.options, ...patch.options };
    const seed = patch.seed ?? q.seed;
    onChange({ options, seed, ...generateMaze(options, seed, { start: patch.start ?? q.start, end: patch.end ?? q.end }) });
  };

  const pickCell = (cell: Cell) => {
    if (picking === 'start') update({ options: { start: 'custom' }, start: cell });
    if (picking === 'end') update({ options: { end: 'custom' }, end: cell });
    setPicking(null);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
        <SettingRow label="Shape">
          <ShapePicker value={q.options.shape} onChange={(shape) => update({ options: { shape } })} />
        </SettingRow>
        <SettingRow label="Size">
          <Segmented value={q.options.size} onChange={(size) => update({ options: { size } })} options={SIZES} />
        </SettingRow>
        <SettingRow label="Start" hint="Green dot">
          <AnchorPicker
            value={q.options.start}
            onChange={(start) => update({ options: { start } })}
            color={START_COLOR}
            picking={picking === 'start'}
            onPick={() => setPicking((p) => (p === 'start' ? null : 'start'))}
          />
        </SettingRow>
        <SettingRow label="Finish" hint="Red dot">
          <AnchorPicker
            value={q.options.end}
            onChange={(end) => update({ options: { end } })}
            color={END_COLOR}
            picking={picking === 'end'}
            onPick={() => setPicking((p) => (p === 'end' ? null : 'end'))}
          />
        </SettingRow>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-medium text-slate-700">
            {picking ? `Click a cell to place the ${picking === 'start' ? 'start' : 'finish'}` : 'Preview'}
          </p>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" icon={showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} onClick={() => setShowSolution((s) => !s)}>
              {showSolution ? 'Hide solution' : 'Show solution'}
            </Button>
            <Button variant="secondary" size="sm" icon={<Shuffle className="h-4 w-4" />} onClick={() => update({ seed: randomSeed() })}>
              New maze
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-lg">
          <MazeBoard
            cells={q.cells}
            start={q.start}
            end={q.end}
            solution={solution}
            onCellClick={picking ? pickCell : undefined}
            colors={{ background: '#f8fafc', wall: '#334155', path: '#4f46e5' }}
            className={picking ? 'rounded-lg ring-2 ring-brand-500/50' : undefined}
          />
        </div>
      </div>
    </div>
  );
}
