import { useMemo } from 'react';
import { randomSeed } from '@shared/puzzles/random';
import {
  MAX_WORD_POINTS,
  WORD_SEARCH_LIMITS,
  cleanWordPoint,
  generateWordSearch,
  normalizeWord,
  wordPointList,
  wordSearchTotal,
} from '@shared/puzzles/wordSearch';
import type { WordSearchQuestion } from '@shared/types';
import { IconAlert } from '@/components/icons';
import { Input } from '@/components/ui';
import { EditableList } from '../../components/EditableList';
import type { TypeEditorProps } from '../types';
import { WordSearchPreview } from './WordSearchPreview';
import { WordSearchSettings } from './WordSearchSettings';
import { unplacedWords } from './unplacedWords';

type PuzzleInput = Partial<Pick<WordSearchQuestion, 'words' | 'wordPoints' | 'options' | 'seed'>>;

interface WordRow {
  word: string;
  points: number;
}

export function WordSearchEditor({ q, onChange }: TypeEditorProps<WordSearchQuestion>) {
  const update = (patch: PuzzleInput) => {
    const next = { ...q, ...patch };
    const { grid, placements } = generateWordSearch(next.words, next.options, next.seed);
    onChange({ ...patch, grid, placements, points: wordSearchTotal(next) });
  };
  const unplaced = useMemo(() => unplacedWords(q), [q]);
  const rows: WordRow[] = useMemo(() => {
    const points = wordPointList(q);
    return q.words.map((word, i) => ({ word, points: points[i] }));
  }, [q]);

  const setRows = (next: WordRow[]) => {
    const words = next.map((r) => r.word);
    const wordPoints = next.map((r) => r.points);
    const wordsChanged = words.length !== q.words.length || words.some((w, i) => w !== q.words[i]);
    if (wordsChanged) update({ words, wordPoints });
    else onChange({ wordPoints, points: wordSearchTotal({ words, wordPoints }) });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-slate-500">Enter the words to hide and how many points each is worth. Spaces, numbers and punctuation are ignored.</p>
          <p className="text-[13px] font-medium text-slate-700">Total: {wordSearchTotal(q)} pts</p>
        </div>
        <EditableList
          items={rows}
          onChange={setRows}
          getText={(r) => r.word}
          setText={(r, word) => ({ ...r, word })}
          create={() => ({ word: '', points: 1 })}
          placeholder={(i) => `Word ${i + 1}`}
          addLabel="Add word"
          numbered
          max={WORD_SEARCH_LIMITS.maxWords}
          suffix={(r, i) => (
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
              <Input
                type="number"
                min={0}
                max={MAX_WORD_POINTS}
                step={0.5}
                value={r.points}
                onChange={(e) => setRows(rows.map((row, idx) => (idx === i ? { ...row, points: cleanWordPoint(e.target.value || 0) } : row)))}
                className="w-20"
                aria-label={`Points for word ${i + 1}`}
              />
              pts
            </label>
          )}
        />
      </div>

      <WordSearchSettings options={q.options} onChange={(o) => update({ options: { ...q.options, ...o } })} />

      {unplaced.length > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Couldn&apos;t fit {unplaced.map((w) => normalizeWord(w)).join(', ')}. Make the grid bigger, allow more directions or try another shuffle.
          </span>
        </p>
      )}

      <WordSearchPreview q={q} onShuffle={() => update({ seed: randomSeed() })} />
    </div>
  );
}
