import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { foundWords, isSegment, matchSegment, normalizeWord, placementSegment, wordPointList, type Segment } from '@shared/puzzles/wordSearch';
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

  /** Word index → where it sits, when the full question is available (presenter or after reveal). */
  const placementOf = useMemo(() => {
    const map = new Map<number, Segment>();
    const placements = (solution ?? q).placements;
    words.forEach((w, i) => {
      const p = placements.find((pl) => normalizeWord(pl.word) === normalizeWord(w));
      if (p) map.set(i, placementSegment(p));
    });
    return map;
  }, [solution, q, words]);

  const canReveal = !interactive && !solution && placementOf.size > 0;
  const [revealed, setRevealed] = useState<{ id: string; words: Set<number> }>({ id: q.id, words: new Set() });
  const shown = revealed.id === q.id ? revealed.words : new Set<number>();
  const setShown = (next: Set<number>) => setRevealed({ id: q.id, words: next });
  const toggleWord = (i: number) => {
    if (!placementOf.has(i)) return;
    const next = new Set(shown);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setShown(next);
  };
  const allShown = placementOf.size > 0 && [...placementOf.keys()].every((i) => shown.has(i));

  const select = (seg: Segment) => {
    const i = matchSegment(q, seg, new Set(found.keys()));
    if (i < 0) return false;
    onChange([...segments, seg]);
    return true;
  };

  const highlights = [
    ...[...found].map(([i, seg]) => ({ seg, color: colorOf(i) })),
    ...(canReveal ? [...shown].flatMap((i) => (placementOf.has(i) ? [{ seg: placementOf.get(i)!, color: colorOf(i) }] : [])) : []),
  ];
  const missedOutlines = solution
    ? [...placementOf].filter(([i]) => !found.has(i)).map(([, seg]) => ({ seg, color: CORRECT }))
    : [];

  const points = wordPointList({ words, wordPoints: (solution ?? q).wordPoints });
  const varied = points.some((p) => p !== points[0]);
  const items: WordListItem[] = words.map((word, i) => ({
    word,
    color: found.has(i) || (canReveal && shown.has(i)) ? colorOf(i) : null,
    missed: !!solution && interactive && !found.has(i),
    points: varied ? points[i] : undefined,
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
      {canReveal ? (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold">
          <span className="opacity-75">Click a word to show where it is</span>
          <button
            type="button"
            onClick={() => setShown(allShown ? new Set() : new Set(placementOf.keys()))}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:opacity-80"
            style={{ background: theme.choiceBg, color: theme.choiceText }}
          >
            {allShown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {allShown ? 'Hide all' : 'Show all'}
          </button>
        </div>
      ) : (
        <div className="text-center text-sm font-bold tabular-nums opacity-75">
          {found.size} of {total} {total === 1 ? 'word' : 'words'} found
        </div>
      )}
      <WordList items={items} hidden={!showList} theme={theme} choiceCss={choiceCss} onToggle={canReveal ? toggleWord : undefined} />
    </div>
  );
}
