import type { ChoiceLayout, MultipleChoiceQuestion } from './types.ts';

export const DEFAULT_CHOICE_LAYOUT: ChoiceLayout = { labels: 'letters', columns: 'auto', size: 'md' };

export const CHOICE_ICON_KEYS = [
  'triangle',
  'diamond',
  'circle',
  'square',
  'star',
  'heart',
  'hexagon',
  'moon',
  'bolt',
  'drop',
  'leaf',
  'sun',
  'cloud',
  'flower',
  'crown',
  'bell',
] as const;

export type ChoiceIconKey = (typeof CHOICE_ICON_KEYS)[number];

export const isChoiceIconKey = (value: unknown): value is ChoiceIconKey =>
  typeof value === 'string' && (CHOICE_ICON_KEYS as readonly string[]).includes(value);

/** Icon for a choice: its own pick, otherwise a distinct default based on position. */
export const choiceIconFor = (icon: string | null | undefined, index: number): ChoiceIconKey =>
  isChoiceIconKey(icon) ? icon : CHOICE_ICON_KEYS[index % CHOICE_ICON_KEYS.length];

export const resolveChoiceLayout = (q: Pick<MultipleChoiceQuestion, 'layout'>): ChoiceLayout => ({
  ...DEFAULT_CHOICE_LAYOUT,
  ...q.layout,
});

/** Column count used when layout is 'auto': keeps 3 choices on one row, 4 as a 2×2 grid. */
export function columnCount(layout: ChoiceLayout, choiceCount: number): number {
  if (layout.columns !== 'auto') return Number(layout.columns);
  if (choiceCount <= 2) return choiceCount;
  if (choiceCount === 3) return 3;
  if (choiceCount === 4) return 2;
  return 3;
}

export const choiceLetter = (index: number) => String.fromCharCode(65 + index);
