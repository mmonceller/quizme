import type { Cell, MazeAnchor, MazeOptions } from '../../types.ts';
import { randInt, seededRng, shuffleWith, type Rng } from '../random.ts';
import { STEPS, encodeMaze, sameCell } from './grid.ts';
import { mazeDimensions, shapeMask } from './shapes.ts';

export interface MazeLayout {
  cells: string[];
  start: Cell;
  end: Cell;
}

const ANCHOR_POINTS: Record<Exclude<MazeAnchor, 'random' | 'custom'>, [number, number]> = {
  'top-left': [-1, -1],
  top: [0, -1],
  'top-right': [1, -1],
  left: [-1, 0],
  center: [0, 0],
  right: [1, 0],
  'bottom-left': [-1, 1],
  bottom: [0, 1],
  'bottom-right': [1, 1],
};

/** Keeps only the largest 4-connected region so every cell is reachable. */
function largestRegion(mask: boolean[][]): Cell[] {
  const rows = mask.length;
  const cols = mask[0]?.length ?? 0;
  const seen = mask.map((row) => row.map(() => false));
  let best: Cell[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (!mask[r][c] || seen[r][c]) continue;
      const region: Cell[] = [];
      const stack: Cell[] = [[r, c]];
      seen[r][c] = true;
      while (stack.length) {
        const [cr, cc] = stack.pop()!;
        region.push([cr, cc]);
        for (const s of STEPS) {
          const nr = cr + s.dr;
          const nc = cc + s.dc;
          if (mask[nr]?.[nc] && !seen[nr][nc]) {
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }
      if (region.length > best.length) best = region;
    }
  return best;
}

/** Randomized depth-first search: a "perfect" maze with exactly one route between any two cells. */
function carve(open: number[][], cells: Cell[], rng: Rng) {
  const visited = open.map((row) => row.map(() => false));
  const stack: Cell[] = [cells[randInt(rng, cells.length)]];
  visited[stack[0][0]][stack[0][1]] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const next = shuffleWith(rng, STEPS).find((s) => (open[r + s.dr]?.[c + s.dc] ?? -1) >= 0 && !visited[r + s.dr][c + s.dc]);
    if (!next) {
      stack.pop();
      continue;
    }
    const nr = r + next.dr;
    const nc = c + next.dc;
    open[r][c] |= next.bit;
    open[nr][nc] |= next.opposite;
    visited[nr][nc] = true;
    stack.push([nr, nc]);
  }
}

function distancesFrom(open: number[][], from: Cell): Map<string, number> {
  const dist = new Map<string, number>([[from.join(','), 0]]);
  const queue: Cell[] = [from];
  while (queue.length) {
    const [r, c] = queue.shift()!;
    const d = dist.get(`${r},${c}`)!;
    for (const s of STEPS) {
      const key = `${r + s.dr},${c + s.dc}`;
      if (open[r][c] & s.bit && !dist.has(key)) {
        dist.set(key, d + 1);
        queue.push([r + s.dr, c + s.dc]);
      }
    }
  }
  return dist;
}

function nearest(cells: Cell[], rows: number, cols: number, [x, y]: [number, number]): Cell {
  let best = cells[0];
  let bestD = Infinity;
  for (const cell of cells) {
    const cx = ((cell[1] + 0.5) / cols) * 2 - 1;
    const cy = ((cell[0] + 0.5) / rows) * 2 - 1;
    const d = (cx - x) ** 2 + (cy - y) ** 2;
    if (d < bestD - 1e-9) {
      best = cell;
      bestD = d;
    }
  }
  return best;
}

function cellPoint([r, c]: Cell, rows: number, cols: number): [number, number] {
  return [((c + 0.5) / cols) * 2 - 1, ((r + 0.5) / rows) * 2 - 1];
}

export function generateMaze(
  options: MazeOptions,
  seed: number,
  custom: { start?: Cell; end?: Cell } = {},
): MazeLayout {
  const rng = seededRng(seed);
  const { rows, cols } = mazeDimensions(options.shape, options.size);
  const region = largestRegion(shapeMask(options.shape, rows, cols));
  const open = Array.from({ length: rows }, () => Array<number>(cols).fill(-1));
  for (const [r, c] of region) open[r][c] = 0;
  carve(open, region, rng);

  const resolve = (anchor: MazeAnchor, customCell: Cell | undefined): Cell | null => {
    if (anchor === 'custom' && customCell) return nearest(region, rows, cols, cellPoint(customCell, rows, cols));
    if (anchor === 'random' || anchor === 'custom') return null;
    return nearest(region, rows, cols, ANCHOR_POINTS[anchor]);
  };

  const start = resolve(options.start, custom.start) ?? region[randInt(rng, region.length)];
  const dist = distancesFrom(open, start);
  const far = Math.max(...dist.values());
  let end = resolve(options.end, custom.end);
  if (!end || sameCell(end, start)) {
    const candidates = region.filter((c) => (dist.get(c.join(',')) ?? 0) >= far * (options.end === 'random' ? 0.6 : 1));
    end = candidates[randInt(rng, candidates.length)] ?? start;
  }
  return { cells: encodeMaze(open), start, end };
}
