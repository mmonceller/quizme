import { columnCount, resolveChoiceLayout } from '@shared/choiceLayout';
import type { MultipleChoiceQuestion } from '@shared/types';
import { cn } from '@/lib/utils';
import { mediaUrl } from '@/api/config';
import { useDisplay } from '../theme/DisplayContext';
import { ChoiceTile, type TileState } from './ChoiceTile';
import { choiceMarker } from './choiceMarker';
import { stringList, type AnswerViewProps } from './types';

/** Column classes keyed by count; container queries keep the editor preview accurate. */
const COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 @2xs:grid-cols-2',
  3: 'grid-cols-1 @sm:grid-cols-3',
  4: 'grid-cols-2 @lg:grid-cols-4',
};

export function MultipleChoiceView({ q, solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<MultipleChoiceQuestion>) {
  const selected = new Set(stringList(answer));
  const source = solution ?? q;
  const multi = q.multiSelect ?? source.choices.filter((c) => c.correct).length > 1;
  const correctIds = new Set(solution?.choices.filter((c) => c.correct).map((c) => c.id) ?? []);
  const hasImages = q.choices.some((c) => c.image);
  const layout = resolveChoiceLayout(q);
  const cols = Math.min(columnCount(layout, q.choices.length), 4);
  const { fill } = useDisplay();

  const toggle = (id: string) => {
    if (multi) {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange([...next]);
    } else onChange([id]);
  };

  const stateOf = (id: string): TileState => {
    if (solution) {
      if (correctIds.has(id)) return selected.has(id) || !interactive ? 'correct' : 'missed';
      return selected.has(id) ? 'wrong' : 'idle';
    }
    return selected.has(id) ? 'selected' : 'idle';
  };

  return (
    <div className={cn('@container', fill && 'sm:flex sm:flex-1 sm:flex-col')}>
      {multi && interactive && !solution && (
        <p className="mb-3 text-center text-sm font-semibold opacity-75">Select all that apply</p>
      )}
      <div
        className={cn('grid', COLUMNS[cols] ?? COLUMNS[2], hasImages && cols > 1 && 'grid-cols-2', fill && 'sm:flex-1 sm:auto-rows-fr')}
        style={{ gap: 'clamp(8px, 1.4cqi, 24px)' }}
      >
        {q.choices.map((c, i) => {
          const marker = choiceMarker(layout.labels, c, i, layout.size);
          return (
            <ChoiceTile
              key={c.id}
              theme={theme}
              state={stateOf(c.id)}
              size={layout.size}
              badge={marker.badge}
              badgeVariant={marker.variant}
              onClick={interactive && !locked ? () => toggle(c.id) : undefined}
              css={choiceCss}
            >
              {c.image && <img src={mediaUrl(c.image)} alt="" className="mb-2 max-h-40 w-full rounded-xl object-contain" />}
              {c.text}
            </ChoiceTile>
          );
        })}
      </div>
    </div>
  );
}
