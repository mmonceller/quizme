import type { ReactNode } from 'react';
import { choiceLetter } from '@shared/choiceLayout';
import type { Choice, ChoiceLabelStyle, ChoiceSize } from '@shared/types';
import { ChoiceIcon, SignLetter } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { BadgeVariant } from './ChoiceTile';

/** Relative to the badge's font size, which itself scales with the choice text. */
const SIGN_HEIGHT: Record<ChoiceSize, string> = { sm: 'h-[2em]', md: 'h-[2.25em]', lg: 'h-[3.1em]', xl: 'h-[3.6em]' };
const ICON_SIZE: Record<ChoiceSize, string> = {
  sm: 'h-[1.15em] w-[1.15em]',
  md: 'h-[1.25em] w-[1.25em]',
  lg: 'h-[1.33em] w-[1.33em]',
  xl: 'h-[1.45em] w-[1.45em]',
};
const BOTH_LETTER: Record<ChoiceSize, string> = { sm: 'text-[0.75em]', md: 'text-[0.75em]', lg: 'text-[0.75em]', xl: 'text-[0.7em]' };

/** Builds the badge shown on a choice tile for the chosen label style. */
export function choiceMarker(
  labels: ChoiceLabelStyle,
  choice: Pick<Choice, 'icon'>,
  index: number,
  size: ChoiceSize,
): { badge: ReactNode; variant: BadgeVariant } {
  const letter = choiceLetter(index);
  switch (labels) {
    case 'none':
      return { badge: null, variant: 'solid' };
    case 'icons':
      return { badge: <ChoiceIcon icon={choice.icon} index={index} className={ICON_SIZE[size]} />, variant: 'solid' };
    case 'sign':
      return { badge: <SignLetter letter={letter} className={SIGN_HEIGHT[size]} />, variant: 'media' };
    case 'both':
      return {
        badge: (
          <span className="flex flex-col items-center gap-0.5">
            <SignLetter letter={letter} className={SIGN_HEIGHT[size]} />
            <span className={cn('pb-0.5 font-bold leading-none', BOTH_LETTER[size])}>{letter}</span>
          </span>
        ),
        variant: 'media',
      };
    default:
      return { badge: letter, variant: 'solid' };
  }
}
