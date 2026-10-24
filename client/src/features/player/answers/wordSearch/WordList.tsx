import type { CSSProperties } from 'react';
import { normalizeWord } from '@shared/puzzles/wordSearch';
import type { Theme } from '@shared/types';
import { cn } from '@/lib/utils';
import { WRONG } from '../types';

export interface WordListItem {
  word: string;
  /** Highlight color once found or revealed. */
  color: string | null;
  missed?: boolean;
}

export function WordList({
  items,
  hidden,
  theme,
  choiceCss,
  onToggle,
}: {
  items: WordListItem[];
  hidden: boolean;
  theme: Theme;
  choiceCss: CSSProperties;
  /** Makes each word a button (presenter reveals one word at a time). */
  onToggle?: (index: number) => void;
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-2" style={{ ...choiceCss, fontSize: 'clamp(13px, 2.2cqi, 18px)' }}>
      {items.map((item, i) => {
        const masked = hidden && !item.color && !item.missed;
        const Tag = onToggle ? 'button' : 'span';
        return (
          <li key={i}>
            <Tag
              {...(onToggle ? { type: 'button' as const, onClick: () => onToggle(i), 'aria-pressed': !!item.color } : {})}
              className={cn(
                'block rounded-xl border-2 px-3 py-1 font-bold tracking-wide',
                item.color && !onToggle && 'line-through decoration-[3px]',
                onToggle && 'cursor-pointer transition hover:scale-105 active:scale-95',
              )}
              style={{
                background: item.color ? `${item.color}33` : theme.choiceBg,
                color: item.missed ? WRONG : theme.choiceText,
                borderColor: item.color ?? (item.missed ? WRONG : `${theme.accent}33`),
                textDecorationColor: item.color ?? undefined,
              }}
            >
              {masked ? '•'.repeat(normalizeWord(item.word).length || item.word.length) : item.word}
            </Tag>
          </li>
        );
      })}
    </ul>
  );
}
