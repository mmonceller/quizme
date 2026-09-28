import type { TrueFalseQuestion } from '@shared/types';
import { IconCheck, IconClose } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useDisplay } from '../theme/DisplayContext';
import { ChoiceTile, type TileState } from './ChoiceTile';
import type { AnswerViewProps } from './types';

export function TrueFalseView({ solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<TrueFalseQuestion>) {
  const { fill } = useDisplay();
  const stateOf = (value: boolean): TileState => {
    if (solution) {
      if (solution.answer === value) return answer === value || !interactive ? 'correct' : 'missed';
      return answer === value ? 'wrong' : 'idle';
    }
    return answer === value ? 'selected' : 'idle';
  };

  return (
    <div className={cn('grid grid-cols-2', fill && 'sm:flex-1')} style={{ gap: 'clamp(12px, 1.6cqi, 28px)' }}>
      {[true, false].map((value) => (
        <ChoiceTile
          key={String(value)}
          theme={theme}
          state={stateOf(value)}
          onClick={interactive && !locked ? () => onChange(value) : undefined}
          css={{ ...choiceCss, justifyContent: 'center', textAlign: 'center' }}
        >
          <span className="flex flex-col items-center gap-[0.4em] py-[0.4em]">
            {value ? <IconCheck className="h-[2em] w-[2em]" strokeWidth={1.8} /> : <IconClose className="h-[2em] w-[2em]" strokeWidth={1.8} />}
            <span className="font-semibold">{value ? 'True' : 'False'}</span>
          </span>
        </ChoiceTile>
      ))}
    </div>
  );
}
