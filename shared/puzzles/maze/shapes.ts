import type { MazeShape, MazeSize } from '../../types.ts';

export const MAZE_SIZE_CELLS: Record<MazeSize, number> = { sm: 8, md: 12, lg: 16, xl: 22 };

export function mazeDimensions(shape: MazeShape, size: MazeSize): { rows: number; cols: number } {
  const n = MAZE_SIZE_CELLS[size] ?? MAZE_SIZE_CELLS.md;
  if (shape === 'rectangle') return { rows: n, cols: Math.round(n * 1.5) };
  if (shape === 'ring' || shape === 'heart') return { rows: n + 2, cols: n + 2 };
  return { rows: n, cols: n };
}

/** Whether a point (x, y in −1…1, y pointing down) lies inside the shape. */
export function inShape(shape: MazeShape, x: number, y: number): boolean {
  switch (shape) {
    case 'rectangle':
    case 'square':
      return true;
    case 'circle':
      return x * x + y * y <= 1.02;
    case 'ring': {
      const d = x * x + y * y;
      return d <= 1.02 && d >= 0.16;
    }
    case 'diamond':
      return Math.abs(x) + Math.abs(y) <= 1.05;
    case 'triangle':
      return Math.abs(x) <= (y + 1) / 2 + 0.08;
    case 'hexagon':
      return Math.abs(x) <= 1.02 - (Math.abs(y) * 0.87) / Math.sqrt(3);
    case 'heart': {
      const X = x * 1.15;
      const Y = -y * 1.12 + 0.13;
      const a = X * X + Y * Y - 1;
      return a * a * a - X * X * Y * Y * Y <= 0;
    }
  }
}

/** Cell mask for the shape, normalized to cell centers. */
export function shapeMask(shape: MazeShape, rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => inShape(shape, ((c + 0.5) / cols) * 2 - 1, ((r + 0.5) / rows) * 2 - 1)),
  );
}
