import { useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { AnswerMap, Question, QuizSettings } from '@shared/types';
import { DEFAULT_END_SCREEN } from '@shared/defaults';
import { IconCheckCircle, IconFlag, IconSparkle, IconThumbUp, IconTrendUp, IconTrophy, type IconComponent } from '@/components/icons';
import type { FinishResult } from '../engine/types';
import { ThemedCard } from '../theme/ThemedStage';
import { resolveDisplay } from '../theme/DisplayContext';
import { QuestionCard } from './QuestionCard';

function cheer(pct: number): { icon: IconComponent; text: string } {
  if (pct >= 90) return { icon: IconTrophy, text: 'Outstanding' };
  if (pct >= 75) return { icon: IconSparkle, text: 'Great job' };
  if (pct >= 50) return { icon: IconThumbUp, text: 'Nice work' };
  return { icon: IconTrendUp, text: 'Keep practicing' };
}

export function ResultsScreen({
  title,
  result,
  settings,
  reviewQuestions,
  answers,
  onExit,
  onReplay,
}: {
  title: string;
  result: FinishResult | null;
  settings: QuizSettings;
  reviewQuestions?: Question[];
  answers: AnswerMap;
  onExit?: () => void;
  onReplay?: () => void;
}) {
  const theme = settings.theme;
  const end = { ...DEFAULT_END_SCREEN, ...settings.endScreen };
  const [showReview, setShowReview] = useState(false);
  const pct = result && result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
  const c = cheer(pct);
  const scored = !!result && end.showScore;
  const HeadIcon = scored ? c.icon : result ? IconCheckCircle : IconFlag;
  const headline = end.title.trim() || (scored ? c.text : result ? 'Thanks for taking the quiz' : "That's a wrap");
  const ringR = 70;
  const ringC = 2 * Math.PI * ringR;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-10">
      <ThemedCard theme={theme} variant={resolveDisplay(settings).cardStyle} className="animate-pop p-8 text-center sm:p-12">
        <span
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: `${theme.accent}1f`, color: theme.accent }}
        >
          <HeadIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{headline}</h1>
        {end.message.trim() && <p className="mx-auto mt-3 max-w-xl whitespace-pre-wrap text-lg leading-relaxed opacity-90">{end.message}</p>}
        <p className="mt-2 text-sm opacity-60">{title}</p>
        {result && (end.showScore || end.showBreakdown) && (
          <>
            {end.showScore && (
            <div className="relative mx-auto mt-8 h-40 w-40">
              <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                <circle cx="80" cy="80" r={ringR} fill="none" stroke={`${theme.accent}26`} strokeWidth="8" />
                <circle
                  cx="80"
                  cy="80"
                  r={ringR}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringC * (1 - pct / 100)}
                  className="transition-[stroke-dashoffset] duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold tabular-nums">{pct}%</span>
                <span className="text-sm tabular-nums opacity-70">
                  {result.score} / {result.maxScore} pts
                </span>
              </div>
            </div>
            )}
            {end.showBreakdown && !(reviewQuestions && end.allowReview) && Object.keys(result.results).length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-1.5">
                {Object.values(result.results).map((r, i) => (
                  <span
                    key={i}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold tabular-nums text-white"
                    style={{ background: r.correct ? '#15803d' : r.earned > 0 ? '#d97706' : '#be123c' }}
                    title={`Question ${i + 1}: ${r.earned}/${r.max}`}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {onReplay && end.allowReplay && (
            <button
              onClick={onReplay}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-opacity hover:opacity-90"
              style={{ background: theme.choiceBg, color: theme.choiceText }}
            >
              <RotateCcw className="h-4 w-4" /> Start over
            </button>
          )}
          {reviewQuestions && result && end.allowReview && (
            <button
              onClick={() => setShowReview((s) => !s)}
              className="rounded-xl px-5 py-2.5 font-semibold transition-opacity hover:opacity-90"
              style={{ background: theme.choiceBg, color: theme.choiceText }}
            >
              {showReview ? 'Hide answers' : 'Review answers'}
            </button>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: theme.accent }}
            >
              <X className="h-4 w-4" /> Exit
            </button>
          )}
        </div>
      </ThemedCard>

      {showReview && reviewQuestions && (
        <div className="mt-6 space-y-4">
          {reviewQuestions.map((q, i) => (
            <QuestionCard
              key={q.id}
              number={i + 1}
              question={q}
              solution={q}
              settings={settings}
              answer={answers[q.id]}
              interactive
              locked
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
