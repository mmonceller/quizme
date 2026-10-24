import type { Cell } from '@shared/types';
import { connected, sameCell, type MazeGrid } from '@shared/puzzles/maze';

/**
 * Moves the end of the path toward a cell: backtracks if the cell is already on the path,
 * otherwise walks straight along open corridors as far as it can toward it.
 */
export function extendPath(maze: MazeGrid, path: Cell[], target: Cell): Cell[] {
  const onPath = path.findIndex((c) => sameCell(c, target));
  if (onPath >= 0) return onPath === path.length - 1 ? path : path.slice(0, onPath + 1);
  const last = path[path.length - 1];
  if (!last || (last[0] !== target[0] && last[1] !== target[1])) return path;
  const dr = Math.sign(target[0] - last[0]);
  const dc = Math.sign(target[1] - last[1]);
  const next = [...path];
  let cur = last;
  while (!sameCell(cur, target)) {
    const step: Cell = [cur[0] + dr, cur[1] + dc];
    if (!connected(maze, cur, step) || next.some((c) => sameCell(c, step))) break;
    next.push(step);
    cur = step;
  }
  return next.length === path.length ? path : next;
}

const ARROWS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

/** One step with the keyboard; stepping back onto the previous cell undoes the last move. */
export function stepPath(maze: MazeGrid, path: Cell[], key: string): Cell[] | null {
  const dir = ARROWS[key];
  const last = path[path.length - 1];
  if (!dir || !last) return null;
  const target: Cell = [last[0] + dir[0], last[1] + dir[1]];
  if (path.length > 1 && sameCell(path[path.length - 2], target)) return path.slice(0, -1);
  return connected(maze, last, target) && !path.some((c) => sameCell(c, target)) ? [...path, target] : path;
}
