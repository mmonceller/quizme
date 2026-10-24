import { useMemo } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { isCell, isSolved, sameCell, solveMaze } from '@shared/puzzles/maze';
import type { Cell, MazeQuestion } from '@shared/types';
import { MazeBoard } from '@/components/puzzles/maze';
import { CORRECT, type AnswerViewProps } from '../types';

export function MazeView({ q, solution, answer, onChange, interactive, locked, theme }: AnswerViewProps<MazeQuestion>) {
  const path = useMemo<Cell[]>(() => {
    const cells = Array.isArray(answer) ? answer.filter(isCell) : [];
    return cells.length && sameCell(cells[0], q.start) ? cells : [q.start];
  }, [answer, q.start]);
  const solved = isSolved(q, path);
  const route = useMemo(() => (solution ? solveMaze(solution) : null), [solution]);
  const canDraw = interactive && !locked && !solution;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3">
      {canDraw && (
        <p className="text-center text-sm font-semibold opacity-75">
          Draw a path from the green start to the red finish — drag through the corridors or use the arrow keys
        </p>
      )}
      <MazeBoard
        cells={q.cells}
        start={q.start}
        end={q.end}
        startMarker={q.startMarker}
        endMarker={q.endMarker}
        path={path}
        solution={solution && !solved ? route : null}
        onPathChange={canDraw ? onChange : undefined}
        colors={{ background: theme.choiceBg, wall: theme.choiceText, path: theme.accent }}
      />
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold">
        {solved ? (
          <span className="rounded-full px-3 py-1 text-white" style={{ background: CORRECT }}>
            Finish reached!
          </span>
        ) : (
          <span className="opacity-75">{path.length > 1 ? `${path.length - 1} steps so far` : 'Start at the green marker'}</span>
        )}
        {canDraw && path.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onChange(path.slice(0, -1))}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:opacity-80"
              style={{ background: theme.choiceBg, color: theme.choiceText }}
            >
              <Undo2 className="h-4 w-4" /> Undo
            </button>
            <button
              type="button"
              onClick={() => onChange([q.start])}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:opacity-80"
              style={{ background: theme.choiceBg, color: theme.choiceText }}
            >
              <RotateCcw className="h-4 w-4" /> Start over
            </button>
          </>
        )}
      </div>
    </div>
  );
}
