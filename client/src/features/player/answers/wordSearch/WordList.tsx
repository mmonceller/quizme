import type { CSSProperties } from 'react';
import { normalizeWord } from '@shared/puzzles/wordSearch';
import type { Theme } from '@shared/types';
import { cn } from '@/lib/utils';
import { WRONG } from '../types';

export interface WordListItem {
  word: string;
  /** Highlight color once found. */
  color: string | null;
  missed?: boolean;
}

export function WordList({ items, hidden, theme, choiceCss }: { items: WordListItem[]; hidden: boolean; theme: Theme; choiceCss: CSSProperties }) {
  return (
    <ul className="flex flex-wrap justify-center gap-2" style={{ ...choiceCss, fontSize: 'clamp(13px, 2.2cqi, 18px)' }}>
      {items.map((item, i) => {
        const masked = hidden && !item.color && !item.missed;
        return (
          <li
            key={i}
            className={cn('rounded-xl border-2 px-3 py-1 font-bold tracking-wide', item.color && 'line-through decoration-[3px]')}
            style={{
              background: item.color ? `${item.color}33` : theme.choiceBg,
              color: item.missed ? WRONG : theme.choiceText,
              borderColor: item.color ?? (item.missed ? WRONG : `${theme.accent}33`),
              textDecorationColor: item.color ?? undefined,
            }}
          >
            {masked ? '•'.repeat(normalizeWord(item.word).length || item.word.length) : item.word}
          </li>
        );
      })}
    </ul>
  );
}
