import type { SVGProps } from 'react';
import type { Segment } from '@shared/puzzles/wordSearch';

/** Rounded bar covering a run of cells (1 viewBox unit per cell). */
export function Capsule({ seg, thickness = 0.8, ...rest }: { seg: Segment; thickness?: number } & SVGProps<SVGRectElement>) {
  const [r1, c1, r2, c2] = seg;
  const x1 = c1 + 0.5;
  const y1 = r1 + 0.5;
  const x2 = c2 + 0.5;
  const y2 = r2 + 0.5;
  const length = Math.hypot(x2 - x1, y2 - y1) + thickness;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <rect
      x={-length / 2}
      y={-thickness / 2}
      width={length}
      height={thickness}
      rx={thickness / 2}
      transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2}) rotate(${angle})`}
      {...rest}
    />
  );
}
