import type { Cell, MazeQuestion } from '../../types.ts';

export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

export const STEPS: { bit: number; opposite: number; dr: number; dc: number }[] = [
  { bit: N, opposite: S, dr: -1, dc: 0 },
  { bit: E, opposite: W, dr: 0, dc: 1 },
  { bit: S, opposite: N, dr: 1, dc: 0 },
  { bit: W, opposite: E, dr: 0, dc: -1 },
];

export interface MazeGrid {
  rows: number;
  cols: number;
  /** Open-side bits per cell, or −1 outside the shape. */
  open: number[][];
}

export function parseMaze(cells: string[]): MazeGrid {
  const cols = Math.max(0, ...cells.map((row) => row.length));
  const open = cells.map((row) =>
    Array.from({ length: cols }, (_, c) => {
      const ch = row[c];
      return ch === undefined || ch === '.' ? -1 : parseInt(ch, 16) || 0;
    }),
  );
  return { rows: cells.length, cols, open };
}

export function encodeMaze(open: number[][]): string[] {
  return open.map((row) => row.map((v) => (v < 0 ? '.' : v.toString(16))).join(''));
}

export const isActive = (m: MazeGrid, [r, c]: Cell) => (m.open[r]?.[c] ?? -1) >= 0;

export const sameCell = (a: Cell | undefined, b: Cell | undefined) => !!a && !!b && a[0] === b[0] && a[1] === b[1];

/** Whether a wall-free passage joins two orthogonally adjacent cells. */
export function connected(m: MazeGrid, a: Cell, b: Cell): boolean {
  const step = STEPS.find((s) => a[0] + s.dr === b[0] && a[1] + s.dc === b[1]);
  return !!step && isActive(m, a) && isActive(m, b) && (m.open[a[0]][a[1]] & step.bit) !== 0;
}

export function isCell(value: unknown): value is Cell {
  return Array.isArray(value) && value.length === 2 && value.every((n) => Number.isInteger(n));
}

/** Shortest route from start to end, or null if they are not connected. */
export function solveMaze(q: Pick<MazeQuestion, 'cells' | 'start' | 'end'>): Cell[] | null {
  const m = parseMaze(q.cells);
  if (!isActive(m, q.start) || !isActive(m, q.end)) return null;
  const prev = new Map<string, Cell | null>([[q.start.join(','), null]]);
  const queue: Cell[] = [q.start];
  while (queue.length) {
    const cur = queue.shift()!;
    if (sameCell(cur, q.end)) {
      const path: Cell[] = [];
      for (let at: Cell | null = cur; at; at = prev.get(at.join(','))!) path.unshift(at);
      return path;
    }
    for (const s of STEPS) {
      const next: Cell = [cur[0] + s.dr, cur[1] + s.dc];
      if (!prev.has(next.join(',')) && connected(m, cur, next)) {
        prev.set(next.join(','), cur);
        queue.push(next);
      }
    }
  }
  return null;
}

/** A path solves the maze when it walks from start to end through open passages. */
export function isSolved(q: Pick<MazeQuestion, 'cells' | 'start' | 'end'>, path: unknown): boolean {
  if (!Array.isArray(path) || path.length === 0 || !path.every(isCell)) return false;
  if (!sameCell(path[0], q.start) || !sameCell(path[path.length - 1], q.end)) return false;
  const m = parseMaze(q.cells);
  return path.every((cell, i) => i === 0 || connected(m, path[i - 1], cell));
}
