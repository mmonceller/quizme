import type { CSSProperties, ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import type { ChoiceSize, Theme } from '@shared/types';
import { cn } from '@/lib/utils';
import { useDisplay } from '../theme/DisplayContext';
import { CORRECT, WRONG } from './types';

export type TileState = 'idle' | 'selected' | 'correct' | 'wrong' | 'missed';
export type BadgeVariant = 'solid' | 'media';

/** Sizes are in em so tiles grow with the (container-scaled) choice text. */
export const TILE_SIZES: Record<ChoiceSize, { tile: string; font: string; badge: string; media: string; vertical: boolean }> = {
  sm: { tile: 'min-h-[2.4em] gap-[0.5em] p-[0.5em]', font: 'text-[0.7em]', badge: 'h-[2.3em] min-w-[2.3em]', media: 'p-[0.25em]', vertical: false },
  md: { tile: 'min-h-[3.2em] gap-[0.6em] p-[0.7em]', font: 'text-[0.8em]', badge: 'h-[2.25em] min-w-[2.25em]', media: 'p-[0.25em]', vertical: false },
  lg: { tile: 'min-h-[7em] gap-[0.6em] p-[0.9em]', font: 'text-[0.9em]', badge: 'h-[2.7em] min-w-[2.7em]', media: 'p-[0.3em]', vertical: true },
  xl: { tile: 'min-h-[10em] gap-[0.7em] p-[1.1em]', font: 'text-[1.1em]', badge: 'h-[2.9em] min-w-[2.9em]', media: 'p-[0.35em]', vertical: true },
};

/** A large, touch-friendly answer tile used by choice-based question types. */
export function ChoiceTile({
  theme,
  state,
  badge,
  badgeVariant = 'solid',
  size = 'md',
  onClick,
  disabled,
  children,
  css,
}: {
  theme: Theme;
  state: TileState;
  badge?: ReactNode;
  badgeVariant?: BadgeVariant;
  size?: ChoiceSize;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  css?: CSSProperties;
}) {
  const s = TILE_SIZES[size];
  const { choiceBorders } = useDisplay();
  const border =
    state === 'correct' || state === 'missed'
      ? CORRECT
      : state === 'wrong'
        ? WRONG
        : state === 'selected'
          ? theme.accent
          : `${theme.accent}33`;
  const tileBorder = state === 'idle' && !choiceBorders ? 'transparent' : border;
  const bg =
    state === 'correct'
      ? `${CORRECT}22`
      : state === 'wrong'
        ? `${WRONG}1a`
        : state === 'selected'
          ? `${theme.accent}22`
          : theme.choiceBg;
  const mark =
    state === 'correct' || state === 'missed' ? (
      <Check className="h-[1.2em] w-[1.2em] shrink-0" style={{ color: CORRECT }} strokeWidth={3} />
    ) : state === 'wrong' ? (
      <X className="h-[1.2em] w-[1.2em] shrink-0" style={{ color: WRONG }} strokeWidth={3} />
    ) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        'relative flex h-full w-full rounded-2xl border-[3px] text-left transition outline-none focus-visible:ring-4 focus-visible:ring-white/40',
        s.tile,
        s.vertical ? 'flex-col items-center justify-center text-center' : 'items-center',
        onClick && !disabled && 'hover:opacity-90 active:scale-[0.99]',
        state === 'missed' && 'border-dashed',
      )}
      style={{ ...css, borderColor: tileBorder, background: bg, color: css?.color ?? theme.choiceText }}
    >
      {badge !== undefined && badge !== null && (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-[0.6em] font-bold leading-none',
            s.font,
            badgeVariant === 'solid' ? cn(s.badge, 'px-[0.3em]') : s.media,
          )}
          style={
            badgeVariant === 'solid'
              ? { background: state === 'idle' ? `${theme.accent}22` : border, color: state === 'idle' ? theme.accent : '#fff', fontFamily: 'inherit' }
              : { background: '#fff', boxShadow: `inset 0 0 0 2px ${state === 'idle' ? `${theme.accent}33` : border}`, color: '#1e293b', fontFamily: 'inherit' }
          }
        >
          {badge}
        </span>
      )}
      <span className={cn('min-w-0', s.vertical ? 'w-full' : 'flex-1')} style={s.vertical ? { textAlign: 'center' } : undefined}>
        {children}
      </span>
      {mark && (s.vertical ? <span className="absolute top-2.5 right-2.5">{mark}</span> : mark)}
    </button>
  );
}
