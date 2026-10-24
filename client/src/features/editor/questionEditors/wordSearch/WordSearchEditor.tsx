import { useMemo } from 'react';
import { randomSeed } from '@shared/puzzles/random';
import { WORD_SEARCH_LIMITS, generateWordSearch, normalizeWord } from '@shared/puzzles/wordSearch';
import type { WordSearchQuestion } from '@shared/types';
import { IconAlert } from '@/components/icons';
import { EditableList } from '../../components/EditableList';
import type { TypeEditorProps } from '../types';
import { WordSearchPreview } from './WordSearchPreview';
import { WordSearchSettings } from './WordSearchSettings';
import { unplacedWords } from './unplacedWords';

type PuzzleInput = Partial<Pick<WordSearchQuestion, 'words' | 'options' | 'seed'>>;

export function WordSearchEditor({ q, onChange }: TypeEditorProps<WordSearchQuestion>) {
  const update = (patch: PuzzleInput) => {
    const next = { ...q, ...patch };
    const { grid, placements } = generateWordSearch(next.words, next.options, next.seed);
    onChange({ ...patch, grid, placements });
  };
  const unplaced = useMemo(() => unplacedWords(q), [q]);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm text-slate-500">Enter the words to hide. Spaces, numbers and punctuation are ignored.</p>
        <EditableList
          items={q.words}
          onChange={(words) => update({ words })}
          getText={(w) => w}
          setText={(_, text) => text}
          create={() => ''}
          placeholder={(i) => `Word ${i + 1}`}
          addLabel="Add word"
          numbered
          max={WORD_SEARCH_LIMITS.maxWords}
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
