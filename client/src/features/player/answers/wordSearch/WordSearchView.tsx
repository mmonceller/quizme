import { useMemo } from 'react';
import { foundWords, isSegment, matchSegment, normalizeWord, placementSegment, type Segment } from '@shared/puzzles/wordSearch';
import type { WordSearchQuestion } from '@shared/types';
import { HIGHLIGHT_COLORS, WordSearchBoard } from '@/components/puzzles/wordSearch';
import { CORRECT, type AnswerViewProps } from '../types';
import { WordList, type WordListItem } from './WordList';

export function WordSearchView({ q, solution, answer, onChange, interactive, locked, theme, choiceCss }: AnswerViewProps<WordSearchQuestion>) {
  const segments = useMemo(() => (Array.isArray(answer) ? answer.filter(isSegment) : []), [answer]);
  const found = useMemo(() => foundWords(q, segments), [q, segments]);
  const words = solution?.words ?? q.words;
  const total = words.filter((w) => normalizeWord(w).length >= 2 || w.startsWith('•')).length;
  const colorOf = (i: number) => HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length];
  const canSelect = interactive && !locked && !solution;

  const select = (seg: Segment) => {
    const i = matchSegment(q, seg, new Set(found.keys()));
    if (i < 0) return false;
    onChange([...segments, seg]);
    return true;
  };

  const highlights = [...found].map(([i, seg]) => ({ seg, color: colorOf(i) }));
  const missedOutlines = solution
    ? solution.placements
        .map((p) => ({ p, i: solution.words.findIndex((w) => normalizeWord(w) === normalizeWord(p.word)) }))
        .filter(({ i }) => !found.has(i))
        .map(({ p }) => ({ seg: placementSegment(p), color: CORRECT }))
    : [];

  const items: WordListItem[] = words.map((word, i) => ({
    word,
    color: found.has(i) ? colorOf(i) : null,
    missed: !!solution && interactive && !found.has(i),
  }));
  const showList = q.options.showWordList || !!solution;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {canSelect && (
        <p className="text-center text-sm font-semibold opacity-75">
          Drag across the letters (or tap the first and last letter) to mark a word
        </p>
      )}
      <WordSearchBoard
        grid={q.grid}
        highlights={highlights}
        outlines={missedOutlines}
        onSelect={canSelect ? select : undefined}
        colors={{ background: theme.choiceBg, text: theme.choiceText, accent: theme.accent }}
      />
      <div className="text-center text-sm font-bold tabular-nums opacity-75">
        {found.size} of {total} {total === 1 ? 'word' : 'words'} found
      </div>
      <WordList items={items} hidden={!showList} theme={theme} choiceCss={choiceCss} />
    </div>
  );
}
