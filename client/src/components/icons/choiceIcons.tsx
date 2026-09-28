import type { ReactNode } from 'react';
import { choiceIconFor, type ChoiceIconKey } from '@shared/choiceLayout';
import { cn } from '@/lib/utils';

/** Solid glyphs on a 24px grid, designed to read clearly at badge sizes. */
const SHAPES: Record<ChoiceIconKey, ReactNode> = {
  triangle: <path d="M12 3.5 21.5 20h-19z" />,
  diamond: <path d="M12 2.5 21.5 12 12 21.5 2.5 12z" />,
  circle: <circle cx="12" cy="12" r="9" />,
  square: <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />,
  star: <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />,
  heart: <path d="M12 20.5s-8.5-5.1-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 5.9-8.5 11-8.5 11z" />,
  hexagon: <path d="M12 2.5 20.5 7.3v9.4L12 21.5l-8.5-4.8V7.3z" />,
  moon: <path d="M20 14.6A8.5 8.5 0 1 1 9.4 4a6.8 6.8 0 0 0 10.6 10.6z" />,
  bolt: <path d="M13.5 2 4.5 13.5h6l-1 8.5 9-11.5h-6z" />,
  drop: <path d="M12 2.8s6.8 7.3 6.8 11.9a6.8 6.8 0 0 1-13.6 0C5.2 10.1 12 2.8 12 2.8z" />,
  leaf: <path d="M20.5 3.5C9 3.5 3.5 8.6 3.5 15.2c0 2 .6 3.7 1.5 5.3 1-3.6 3.6-6.9 7.4-8.8-3 2.4-5 5.5-5.8 8.7 1.2.5 2.6.8 4 .8 6.7 0 9.9-6.4 9.9-17.7z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.6" />
      <path d="M11 1.8h2v3.6h-2zM11 18.6h2v3.6h-2zM1.8 11h3.6v2H1.8zM18.6 11h3.6v2h-3.6zM4.1 5.5l1.4-1.4 2.6 2.6-1.4 1.4zM15.9 17.3l1.4-1.4 2.6 2.6-1.4 1.4zM4.1 18.5l2.6-2.6 1.4 1.4-2.6 2.6zM15.9 6.7l2.6-2.6 1.4 1.4-2.6 2.6z" />
    </>
  ),
  cloud: <path d="M7 19.5a4.5 4.5 0 0 1-.6-9A6.3 6.3 0 0 1 18.4 9a5.3 5.3 0 0 1-.9 10.5z" />,
  flower: (
    <path d="M12 2.5a3.5 3.5 0 0 1 3.4 4.3 3.5 3.5 0 0 1 3.9 5.2 3.5 3.5 0 0 1-3.9 5.2A3.5 3.5 0 0 1 12 21.5a3.5 3.5 0 0 1-3.4-4.3 3.5 3.5 0 0 1-3.9-5.2 3.5 3.5 0 0 1 3.9-5.2A3.5 3.5 0 0 1 12 2.5zm0 6.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4z" fillRule="evenodd" />
  ),
  crown: <path d="M3 7.5 7.8 11 12 4.5 16.2 11 21 7.5l-1.8 11H4.8z" />,
  bell: <path d="M12 2.5a1.5 1.5 0 0 1 1.5 1.5v.7a6 6 0 0 1 4.5 5.8v4l2 2.5H4l2-2.5v-4a6 6 0 0 1 4.5-5.8V4A1.5 1.5 0 0 1 12 2.5zM9.5 19.5h5a2.5 2.5 0 0 1-5 0z" />,
};

export const CHOICE_ICON_LABELS: Record<ChoiceIconKey, string> = {
  triangle: 'Triangle',
  diamond: 'Diamond',
  circle: 'Circle',
  square: 'Square',
  star: 'Star',
  heart: 'Heart',
  hexagon: 'Hexagon',
  moon: 'Moon',
  bolt: 'Bolt',
  drop: 'Drop',
  leaf: 'Leaf',
  sun: 'Sun',
  cloud: 'Cloud',
  flower: 'Flower',
  crown: 'Crown',
  bell: 'Bell',
};

export function ChoiceIcon({ icon, index = 0, className }: { icon?: string | null; index?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={cn('h-5 w-5', className)}>
      {SHAPES[choiceIconFor(icon, index)]}
    </svg>
  );
}
