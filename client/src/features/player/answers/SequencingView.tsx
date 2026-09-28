import { ArrowDown, ArrowUp, Check, GripVertical, X } from 'lucide-react';
import type { SequencingQuestion } from '@shared/types';
import { cn, moveItem } from '@/lib/utils';
import { useDragReorder } from './useDragReorder';
import { CORRECT, SOLUTION_STYLE, WRONG, type AnswerViewProps } from './types';

export function SequencingView({ q, solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<SequencingQuestion>) {
  const order = Array.isArray(answer) && answer.length === q.items.length ? answer : q.items.map((i) => i.id);
  const textOf = (id: string) => q.items.find((i) => i.id === id)?.text ?? solution?.items.find((i) => i.id === id)?.text ?? '';
  const showCorrectOrder = solution && !interactive;
  const rows = showCorrectOrder ? solution.items.map((i) => i.id) : order;
  const canMove = interactive && !locked;
  const { listRef, dragId, offset, itemProps } = useDragReorder(order, onChange, canMove);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {canMove && !solution && <p className="text-center text-sm font-semibold opacity-75">Drag the cards or use the arrows to put them in order</p>}
      <ol ref={listRef} className="relative space-y-2">
        {rows.map((id, i) => {
          const ok = solution && interactive ? solution.items[i]?.id === id : null;
          const dragging = dragId === id;
          return (
            <li
              key={id}
              {...(canMove ? itemProps(id) : {})}
              className={cn(
                'relative flex items-center gap-3 rounded-2xl border-[3px] p-2.5',
                canMove && 'cursor-grab select-none',
                dragging ? 'z-10 cursor-grabbing shadow-2xl' : 'transition-[border-color,box-shadow]',
              )}
              style={{
                background: theme.choiceBg,
                color: theme.choiceText,
                borderColor: dragging ? theme.accent : ok === null ? (showCorrectOrder ? CORRECT : `${theme.accent}33`) : ok ? CORRECT : WRONG,
                transform: dragging ? `translateY(${offset}px) scale(1.02)` : undefined,
                ...choiceCss,
              }}
            >
              {canMove && (
                <span data-drag-handle className="-mr-1 flex shrink-0 cursor-grab touch-none items-center self-stretch rounded-lg px-0.5 opacity-50 active:cursor-grabbing" aria-hidden>
                  <GripVertical className="h-5 w-5" />
                </span>
              )}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-extrabold" style={{ background: theme.accent, color: '#fff' }}>
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">{textOf(id)}</span>
              {canMove && (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onChange(moveItem(order, i, i - 1))}
                    disabled={i === 0}
                    className="rounded-lg p-2 transition hover:bg-black/10 disabled:opacity-25"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(moveItem(order, i, i + 1))}
                    disabled={i === order.length - 1}
                    className="rounded-lg p-2 transition hover:bg-black/10 disabled:opacity-25"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </button>
                </span>
              )}
              {ok === true && <Check className="h-6 w-6 shrink-0" style={{ color: CORRECT }} strokeWidth={3} />}
              {ok === false && <X className="h-6 w-6 shrink-0" style={{ color: WRONG }} strokeWidth={3} />}
            </li>
          );
        })}
      </ol>
      {solution && interactive && order.some((id, i) => solution.items[i]?.id !== id) && (
        <div className="rounded-2xl p-4" style={SOLUTION_STYLE}>
          <div className="mb-1 text-sm font-semibold opacity-80">Correct order</div>
          <ol className="list-decimal space-y-0.5 pl-6 font-semibold">
            {solution.items.map((i) => (
              <li key={i.id}>{i.text}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
