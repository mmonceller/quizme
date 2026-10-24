import type { Segment } from '@shared/puzzles/wordSearch';
import { cn } from '@/lib/utils';
import { Capsule } from '../Capsule';
import { useSegmentSelect } from './useSegmentSelect';

export const HIGHLIGHT_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'];

export interface WordSearchBoardProps {
  grid: string[];
  /** Found words, drawn as filled highlights. */
  highlights?: { seg: Segment; color: string }[];
  /** Dashed outlines (e.g. words the participant missed). */
  outlines?: { seg: Segment; color: string }[];
  /** Enables selecting; return true to accept the selection. */
  onSelect?: (seg: Segment) => boolean;
  colors: { background: string; text: string; accent: string };
  className?: string;
}

export function WordSearchBoard({ grid, highlights = [], outlines = [], onSelect, colors, className }: WordSearchBoardProps) {
  const n = grid.length;
  const { selection, rejected, pending, handlers } = useSegmentSelect(n, onSelect);

  return (
    <svg
      viewBox={`-0.15 -0.15 ${n + 0.3} ${n + 0.3}`}
      className={cn('mx-auto block h-auto max-h-[65vh] w-full select-none', onSelect && 'cursor-pointer touch-none', className)}
      style={{ fontFamily: 'inherit' }}
      role="img"
      aria-label={`Word search grid, ${n} by ${n}`}
      {...handlers}
    >
      <rect x={-0.15} y={-0.15} width={n + 0.3} height={n + 0.3} rx={0.45} fill={colors.background} />
      {outlines.map((o, i) => (
        <Capsule key={`o${i}`} seg={o.seg} fill={`${o.color}22`} stroke={o.color} strokeWidth={0.07} strokeDasharray="0.18 0.12" />
      ))}
      {highlights.map((h, i) => (
        <Capsule key={`h${i}`} seg={h.seg} fill={h.color} fillOpacity={0.42} />
      ))}
      {selection && <Capsule seg={selection} fill={colors.accent} fillOpacity={0.35} stroke={colors.accent} strokeWidth={0.05} />}
      {rejected && <Capsule seg={rejected} fill="#dc2626" fillOpacity={0.3} className="animate-pulse" />}
      {pending && <circle cx={pending[1] + 0.5} cy={pending[0] + 0.5} r={0.42} fill={colors.accent} fillOpacity={0.35} />}
      {grid.map((row, r) =>
        [...row].map((ch, c) => (
          <text
            key={`${r}-${c}`}
            x={c + 0.5}
            y={r + 0.53}
            fontSize={0.56}
            fontWeight={700}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.text}
            pointerEvents="none"
          >
            {ch}
          </text>
        )),
      )}
    </svg>
  );
}
