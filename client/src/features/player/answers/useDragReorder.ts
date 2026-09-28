import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { moveItem } from '@/lib/utils';

interface DragState {
  id: string;
  pointerId: number;
  /** pointer distance from the item's top edge when grabbed */
  grab: number;
  lastY: number;
}

/**
 * Pointer-based vertical drag-to-reorder for a list whose children carry `data-id`.
 * Mouse drags start anywhere on an item; touch drags start on `[data-drag-handle]` so the page can still scroll.
 */
export function useDragReorder(order: string[], onReorder: (next: string[]) => void, enabled: boolean) {
  const listRef = useRef<HTMLOListElement>(null);
  const drag = useRef<DragState | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const itemEl = (id: string) => listRef.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`) ?? null;

  const update = (clientY: number) => {
    const d = drag.current;
    const list = listRef.current;
    const el = d && itemEl(d.id);
    if (!d || !list || !el) return;
    const y = clientY - list.getBoundingClientRect().top;
    setOffset(y - d.grab - el.offsetTop);

    const center = y - d.grab + el.offsetHeight / 2;
    const others = order.filter((id) => id !== d.id);
    let target = 0;
    for (const id of others) {
      const o = itemEl(id);
      if (o && o.offsetTop + o.offsetHeight / 2 < center) target++;
    }
    const from = order.indexOf(d.id);
    if (target !== from) onReorder(moveItem(order, from, target));
  };

  // After a reorder the dragged item has a new slot; re-anchor it under the pointer.
  useLayoutEffect(() => {
    if (drag.current) update(drag.current.lastY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const itemProps = (id: string) => ({
    'data-id': id,
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button:not([data-drag-handle])')) return;
      if (e.pointerType !== 'mouse' && !target.closest('[data-drag-handle]')) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      drag.current = { id, pointerId: e.pointerId, grab: e.clientY - rect.top, lastY: e.clientY };
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragId(id);
      setOffset(0);
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      if (drag.current?.pointerId !== e.pointerId) return;
      drag.current.lastY = e.clientY;
      update(e.clientY);
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => end(e),
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => end(e),
  });

  const end = (e: ReactPointerEvent<HTMLElement>) => {
    if (drag.current?.pointerId !== e.pointerId) return;
    drag.current = null;
    setDragId(null);
    setOffset(0);
  };

  return { listRef, dragId, offset, itemProps };
}
