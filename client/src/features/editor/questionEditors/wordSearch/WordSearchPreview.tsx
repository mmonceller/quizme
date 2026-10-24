import { useState } from 'react';
import { Eye, EyeOff, Shuffle } from 'lucide-react';
import { placementSegment } from '@shared/puzzles/wordSearch';
import type { WordSearchQuestion } from '@shared/types';
import { Button } from '@/components/ui';
import { HIGHLIGHT_COLORS, WordSearchBoard } from '@/components/puzzles/wordSearch';

export function WordSearchPreview({ q, onShuffle }: { q: WordSearchQuestion; onShuffle: () => void }) {
  const [showAnswers, setShowAnswers] = useState(true);
  const highlights = showAnswers ? q.placements.map((p, i) => ({ seg: placementSegment(p), color: HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length] })) : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-slate-700">Preview</p>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" icon={showAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} onClick={() => setShowAnswers((s) => !s)}>
            {showAnswers ? 'Hide answers' : 'Show answers'}
          </Button>
          <Button variant="secondary" size="sm" icon={<Shuffle className="h-4 w-4" />} onClick={onShuffle}>
            Shuffle grid
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-md">
        <WordSearchBoard grid={q.grid} highlights={highlights} colors={{ background: '#f8fafc', text: '#0f172a', accent: '#4f46e5' }} className="rounded-lg border border-slate-200" />
      </div>
    </div>
  );
}
