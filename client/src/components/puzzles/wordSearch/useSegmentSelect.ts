import { useRef, useState, type PointerEvent } from 'react';
import type { Segment } from '@shared/puzzles/wordSearch';
import { svgPoint } from '../svgPoint';

type Cell = [number, number];

/** Snaps a drag from the start cell to the nearest of the 8 straight directions, kept inside the grid. */
function snap([r0, c0]: Cell, x: number, y: number, n: number): Segment {
  const dx = x - (c0 + 0.5);
  const dy = y - (r0 + 0.5);
  if (Math.hypot(dx, dy) < 0.5) return [r0, c0, r0, c0];
  const step = Math.round(Math.atan2(dy, dx) / (Math.PI / 4));
  const vr = Math.round(Math.sin((step * Math.PI) / 4));
  const vc = Math.round(Math.cos((step * Math.PI) / 4));
  let len = Math.round((dx * vc + dy * vr) / (vr * vr + vc * vc));
  const inside = (l: number) => r0 + vr * l >= 0 && r0 + vr * l < n && c0 + vc * l >= 0 && c0 + vc * l < n;
  while (len > 0 && !inside(len)) len--;
  return [r0, c0, r0 + vr * Math.max(0, len), c0 + vc * Math.max(0, len)];
}

const sameCell = (s: Segment) => s[0] === s[2] && s[1] === s[3];

/**
 * Drag across letters to select, or tap the first and last letter.
 * `onSelect` returns whether the selection was accepted; rejected ones flash briefly.
 */
export function useSegmentSelect(n: number, onSelect: ((seg: Segment) => boolean) | undefined) {
  const [selection, setSelection] = useState<Segment | null>(null);
  const [rejected, setRejected] = useState<Segment | null>(null);
  const anchor = useRef<Cell | null>(null);
  const tapAnchor = useRef<Cell | null>(null);
  const [pending, setPending] = useState<Cell | null>(null);

  const cellAt = (e: PointerEvent<SVGSVGElement>) => {
    const p = svgPoint(e.currentTarget, e.clientX, e.clientY);
    if (!p) return null;
    const r = Math.floor(p.y);
    const c = Math.floor(p.x);
    return r >= 0 && r < n && c >= 0 && c < n ? { cell: [r, c] as Cell, p } : null;
  };

  const finish = (seg: Segment) => {
    setSelection(null);
    anchor.current = null;
    if (!onSelect || sameCell(seg)) return;
    if (!onSelect(seg)) {
      setRejected(seg);
      window.setTimeout(() => setRejected((cur) => (cur === seg ? null : cur)), 450);
    }
  };

  if (!onSelect) return { selection: null, rejected: null, pending: null, handlers: {} };

  return {
    selection,
    rejected,
    pending,
    handlers: {
      onPointerDown: (e: PointerEvent<SVGSVGElement>) => {
        const hit = cellAt(e);
        if (!hit) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const tap = tapAnchor.current;
        if (tap) {
          tapAnchor.current = null;
          setPending(null);
          if (tap[0] !== hit.cell[0] || tap[1] !== hit.cell[1]) finish(snap(tap, hit.p.x, hit.p.y, n));
          return;
        }
        anchor.current = hit.cell;
        setSelection([hit.cell[0], hit.cell[1], hit.cell[0], hit.cell[1]]);
      },
      onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
        if (!anchor.current) return;
        const p = svgPoint(e.currentTarget, e.clientX, e.clientY);
        if (p) setSelection(snap(anchor.current, p.x, p.y, n));
      },
      onPointerUp: () => {
        if (!anchor.current || !selection) return;
        if (sameCell(selection)) {
          tapAnchor.current = anchor.current;
          setPending(anchor.current);
          anchor.current = null;
          setSelection(null);
          return;
        }
        finish(selection);
      },
      onPointerCancel: () => {
        anchor.current = null;
        setSelection(null);
      },
    },
  };
}
