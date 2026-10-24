import { useMemo, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { Cell, MazeMarker } from '@shared/types';
import { E, N, S, W, parseMaze, sameCell } from '@shared/puzzles/maze';
import { cn } from '@/lib/utils';
import { svgPoint } from '../svgPoint';
import { MarkerArt } from './markers';
import { extendPath, stepPath } from './pathing';

export interface MazeBoardProps {
  cells: string[];
  start: Cell;
  end: Cell;
  startMarker?: MazeMarker;
  endMarker?: MazeMarker;
  path?: Cell[];
  solution?: Cell[] | null;
  /** Lets the user draw a path with pointer or arrow keys. */
  onPathChange?: (path: Cell[]) => void;
  /** Called on a plain click of a maze cell (used by the editor to place start and end). */
  onCellClick?: (cell: Cell) => void;
  colors: { background: string; wall: string; path: string };
  className?: string;
}

const START_COLOR = '#16a34a';
const END_COLOR = '#dc2626';
const DOT: MazeMarker = { type: 'dot' };
/** Picture markers are a little larger than a cell so faces stay recognizable. */
const MARKER_SIZE = 1.35;

const markerBox = ([r, c]: Cell) => ({
  x: c + 0.5 - MARKER_SIZE / 2,
  y: r + 0.5 - MARKER_SIZE / 2,
  width: MARKER_SIZE,
  height: MARKER_SIZE,
});

function wallPath(open: number[][]): string {
  const d: string[] = [];
  open.forEach((row, r) =>
    row.forEach((v, c) => {
      if (v < 0) return;
      if (!(v & N)) d.push(`M${c} ${r}h1`);
      if (!(v & S)) d.push(`M${c} ${r + 1}h1`);
      if (!(v & W)) d.push(`M${c} ${r}v1`);
      if (!(v & E)) d.push(`M${c + 1} ${r}v1`);
    }),
  );
  return d.join('');
}

const points = (path: Cell[]) => path.map(([r, c]) => `${c + 0.5},${r + 0.5}`).join(' ');

export function MazeBoard({
  cells,
  start,
  end,
  startMarker = DOT,
  endMarker = DOT,
  path,
  solution,
  onPathChange,
  onCellClick,
  colors,
  className,
}: MazeBoardProps) {
  const maze = useMemo(() => parseMaze(cells), [cells]);
  const walls = useMemo(() => wallPath(maze.open), [maze]);
  const floor = useMemo(
    () => maze.open.flatMap((row, r) => row.map((v, c) => (v < 0 ? '' : `M${c} ${r}h1v1h-1z`))).join(''),
    [maze],
  );
  const drawing = useRef(false);
  const current = path && path.length ? path : [start];
  const latest = useRef(current);
  latest.current = current;
  const commit = (next: Cell[]) => {
    if (next === latest.current) return;
    latest.current = next;
    onPathChange?.(next);
  };
  const interactive = !!onPathChange || !!onCellClick;

  const cellAt = (e: PointerEvent<SVGSVGElement>): Cell | null => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY);
    if (!p) return null;
    const cell: Cell = [Math.floor(p.y), Math.floor(p.x)];
    return (maze.open[cell[0]]?.[cell[1]] ?? -1) >= 0 ? cell : null;
  };

  const handlers = {
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => {
      const cell = cellAt(e);
      if (!cell) return;
      if (onCellClick) return onCellClick(cell);
      if (!onPathChange) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const next = extendPath(maze, latest.current, cell);
      drawing.current = next.some((c) => sameCell(c, cell));
      commit(next);
    },
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
      if (!drawing.current || !onPathChange) return;
      const cell = cellAt(e);
      if (!cell) return;
      commit(extendPath(maze, latest.current, cell));
    },
    onPointerUp: () => {
      drawing.current = false;
    },
    onKeyDown: (e: KeyboardEvent<SVGSVGElement>) => {
      if (!onPathChange) return;
      const next = stepPath(maze, latest.current, e.key);
      if (!next) return;
      e.preventDefault();
      commit(next);
    },
  };

  const head = current[current.length - 1];
  const startPicture = startMarker.type !== 'dot';
  const endPicture = endMarker.type !== 'dot';
  const pad = startPicture || endPicture ? MARKER_SIZE / 2 : 0.4;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${maze.cols + pad * 2} ${maze.rows + pad * 2}`}
      className={cn(
        'mx-auto block h-auto max-h-[65vh] w-full select-none outline-none',
        interactive && 'cursor-pointer touch-none',
        onPathChange && 'focus-visible:ring-4 focus-visible:ring-current/30 rounded-xl',
        className,
      )}
      tabIndex={onPathChange ? 0 : undefined}
      role="img"
      aria-label="Maze. Draw a path from the green start to the red finish; arrow keys also move."
      {...(interactive ? handlers : {})}
    >
      <path d={floor} fill={colors.background} stroke={colors.background} strokeWidth={0.04} />
      {solution && solution.length > 1 && (
        <polyline points={points(solution)} fill="none" stroke={START_COLOR} strokeWidth={0.22} strokeDasharray="0.25 0.18" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {current.length > 1 && (
        <polyline points={points(current)} fill="none" stroke={colors.path} strokeOpacity={0.85} strokeWidth={0.36} strokeLinecap="round" strokeLinejoin="round" />
      )}
      <path d={walls} fill="none" stroke={colors.wall} strokeWidth={0.12} strokeLinecap="round" />
      {endPicture ? (
        <MarkerArt marker={endMarker} ring={END_COLOR} {...markerBox(end)} />
      ) : (
        <g transform={`translate(${end[1] + 0.5} ${end[0] + 0.5})`}>
          <circle r={0.34} fill={END_COLOR} />
          <circle r={0.14} fill="#fff" />
        </g>
      )}
      {startPicture ? (
        <>
          {current.length > 1 && <circle cx={start[1] + 0.5} cy={start[0] + 0.5} r={0.22} fill={START_COLOR} />}
          <MarkerArt marker={startMarker} ring={START_COLOR} {...markerBox(head)} />
        </>
      ) : (
        <>
          <circle cx={start[1] + 0.5} cy={start[0] + 0.5} r={0.32} fill={START_COLOR} />
          {onPathChange && <circle cx={head[1] + 0.5} cy={head[0] + 0.5} r={0.2} fill={colors.path} stroke="#fff" strokeWidth={0.06} />}
        </>
      )}
    </svg>
  );
}
