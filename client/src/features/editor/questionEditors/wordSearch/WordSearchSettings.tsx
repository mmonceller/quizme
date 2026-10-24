import { ArrowDown, ArrowDownRight, ArrowLeftRight, ArrowRight, type LucideIcon } from 'lucide-react';
import { WORD_SEARCH_LIMITS } from '@shared/puzzles/wordSearch';
import type { WordDirection, WordSearchDifficulty, WordSearchOptions } from '@shared/types';
import { Segmented, Toggle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { SettingRow } from '../../components/SettingRow';

const DIRECTIONS: { value: WordDirection; label: string; icon: LucideIcon }[] = [
  { value: 'horizontal', label: 'Horizontal', icon: ArrowRight },
  { value: 'vertical', label: 'Vertical', icon: ArrowDown },
  { value: 'diagonal', label: 'Diagonal', icon: ArrowDownRight },
];

const DIFFICULTIES: { value: WordSearchDifficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Easy', hint: 'Random filler letters, so the words stand out.' },
  { value: 'medium', label: 'Medium', hint: 'Filler letters are mostly taken from your words, so they blend in.' },
  {
    value: 'hard',
    label: 'Hard',
    hint: 'Filler mimics your words and adds look-alike decoys (a word missing its last letter or with one letter changed).',
  },
];

function Chip({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: LucideIcon; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors',
        active ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800',
      )}
    >
      <Icon className="h-4 w-4" /> {children}
    </button>
  );
}

export function WordSearchSettings({ options, onChange }: { options: WordSearchOptions; onChange: (patch: Partial<WordSearchOptions>) => void }) {
  const toggleDirection = (d: WordDirection) => {
    const has = options.directions.includes(d);
    if (has && options.directions.length === 1) return;
    onChange({ directions: has ? options.directions.filter((x) => x !== d) : DIRECTIONS.map((x) => x.value).filter((x) => x === d || options.directions.includes(x)) });
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <SettingRow label="Grid size" hint={`${options.size} × ${options.size} letters`}>
        <input
          type="range"
          min={WORD_SEARCH_LIMITS.minSize}
          max={WORD_SEARCH_LIMITS.maxSize}
          value={options.size}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
          className="w-full accent-brand-700"
          aria-label="Grid size"
        />
      </SettingRow>
      <SettingRow label="Word directions" hint="At least one">
        <div className="flex flex-wrap gap-1.5">
          {DIRECTIONS.map((d) => (
            <Chip key={d.value} active={options.directions.includes(d.value)} onClick={() => toggleDirection(d.value)} icon={d.icon}>
              {d.label}
            </Chip>
          ))}
          <Chip active={options.reverse} onClick={() => onChange({ reverse: !options.reverse })} icon={ArrowLeftRight}>
            Backwards too
          </Chip>
        </div>
      </SettingRow>
      <SettingRow label="Difficulty">
        <Segmented value={options.difficulty} onChange={(difficulty) => onChange({ difficulty })} options={DIFFICULTIES} />
        <p className="mt-1.5 text-xs text-slate-500">{DIFFICULTIES.find((d) => d.value === options.difficulty)?.hint}</p>
      </SettingRow>
      <Toggle
        checked={options.showWordList}
        onChange={(showWordList) => onChange({ showWordList })}
        label="Show the word list to players"
        description="When off, players only see how many letters each word has."
      />
    </div>
  );
}
