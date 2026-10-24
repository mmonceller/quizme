import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Maximize, Minimize, Pause, Play, RotateCcw, X } from 'lucide-react';
import type { Answer, AnswerMap, GradeResult, Question, QuizSettings, StageWidth } from '@shared/types';
import { fillsHeight, resolveDisplay } from './theme/DisplayContext';
import { effectiveSeconds, shouldReveal } from '@shared/rules';
import { errorMessage } from '@/api/client';
import { cn } from '@/lib/utils';
import { IconCheckCircle, IconClock, IconCrossCircle, IconDocument, IconPartialCircle } from '@/components/icons';
import { ThemedStage } from './theme/ThemedStage';
import { QuestionCard } from './components/QuestionCard';
import { Timer } from './components/Timer';
import { ResultsScreen } from './components/ResultsScreen';
import { useCountdown } from './engine/useCountdown';
import { initialAnswers } from './engine/prepare';
import type { FinishFn, FinishResult, PlayerMode, RevealFn } from './engine/types';

type Phase = 'answering' | 'locked' | 'revealed';

const STAGE_WIDTHS: Record<StageWidth, string> = {
  standard: 'max-w-4xl',
  wide: 'sm:w-[90vw] sm:max-w-none sm:px-0',
  full: 'max-w-none',
};

interface QuizPlayerProps {
  title: string;
  questions: Question[];
  settings: QuizSettings;
  mode: PlayerMode;
  reveal: RevealFn;
  onFinish?: FinishFn;
  onExit?: () => void;
  /** Full questions for the post-quiz review (owner play only). */
  reviewQuestions?: Question[];
}

export function QuizPlayer({ title, questions, settings, mode, reveal, onFinish, onExit, reviewQuestions }: QuizPlayerProps) {
  const interactive = mode === 'public' || (mode === 'play' && settings.interactive);
  const presenter = !interactive;
  const theme = settings.theme;
  const display = resolveDisplay(settings);
  const fill = fillsHeight(display);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>(() => initialAnswers(questions));
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  const [solutions, setSolutions] = useState<Record<string, { question: Question; result: GradeResult }>>({});
  const [paused, setPaused] = useState(false);
  const [restart, setRestart] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState<FinishResult | 'presented' | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const startedAt = useRef(Date.now());
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const q = questions[index];
  const phase: Phase = phases[q?.id] ?? 'answering';
  const seconds = q ? effectiveSeconds(q, settings) : 0;
  const isLast = index === questions.length - 1;
  const revealAllowed = q ? shouldReveal(q, settings) : false;

  const setPhase = (id: string, p: Phase) => setPhases((s) => ({ ...s, [id]: p }));

  const doReveal = useCallback(
    async (question: Question) => {
      try {
        const res = await reveal(question, answers[question.id] ?? null);
        setSolutions((s) => ({ ...s, [question.id]: res }));
        setPhase(question.id, 'revealed');
      } catch (err) {
        setError(errorMessage(err));
        setPhase(question.id, 'locked');
      }
    },
    [reveal, answers],
  );

  const finish = useCallback(async () => {
    if (presenter || !onFinish) {
      setFinished('presented');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setFinished(await onFinish(answers, Math.round((Date.now() - startedAt.current) / 1000)));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [presenter, onFinish, answers]);

  const next = useCallback(() => {
    clearTimeout(advanceTimer.current);
    setError(null);
    setPaused(false);
    if (isLast) void finish();
    else setIndex((i) => i + 1);
  }, [isLast, finish]);

  const lock = useCallback(
    async (reason: 'submit' | 'timeout') => {
      if (!q || phase !== 'answering') return;
      if (revealAllowed) await doReveal(q);
      else setPhase(q.id, 'locked');
      if (reason === 'timeout' && settings.timer.autoAdvance) {
        advanceTimer.current = setTimeout(next, revealAllowed ? 4000 : 1500);
      } else if (reason === 'submit' && !revealAllowed && interactive) {
        next();
      }
    },
    [q, phase, revealAllowed, doReveal, settings.timer.autoAdvance, next, interactive],
  );

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const timerRunning = !!q && seconds > 0 && phase === 'answering' && !paused && !finished;
  const remaining = useCountdown(seconds, timerRunning, `${q?.id}-${restart}`, () => void lock('timeout'));

  const prev = () => {
    clearTimeout(advanceTimer.current);
    setPaused(false);
    setIndex((i) => Math.max(0, i - 1));
  };

  const restartTimer = () => {
    setPhase(q.id, 'answering');
    setSolutions(({ [q.id]: _, ...rest }) => rest);
    setRestart((r) => r + 1);
    setPaused(false);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!presenter || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') next();
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') prev();
      else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key.toLowerCase() === 'r' && phase !== 'revealed') void doReveal(q);
      else if (e.key.toLowerCase() === 'f') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const progress = useMemo(() => ((index + (phase === 'answering' ? 0 : 1)) / questions.length) * 100, [index, phase, questions.length]);

  if (finished) {
    return (
      <ThemedStage theme={theme}>
        <ResultsScreen
          title={title}
          result={finished === 'presented' ? null : finished}
          settings={settings}
          reviewQuestions={reviewQuestions}
          answers={answers}
          onExit={onExit}
          onReplay={
            mode === 'public'
              ? undefined
              : () => {
                  setFinished(null);
                  setIndex(0);
                  setAnswers(initialAnswers(questions));
                  setPhases({});
                  setSolutions({});
                  startedAt.current = Date.now();
                }
          }
        />
      </ThemedStage>
    );
  }

  if (!q) {
    return (
      <ThemedStage theme={theme} className="flex items-center justify-center p-6">
        <div className="text-center">
          <IconDocument className="mx-auto h-12 w-12 opacity-60" strokeWidth={1.3} />
          <p className="mt-4 text-lg font-semibold">This quiz has no questions yet.</p>
          {onExit && (
            <button onClick={onExit} className="mt-6 rounded-lg px-5 py-2.5 font-semibold text-white" style={{ background: theme.accent }}>
              Go back
            </button>
          )}
        </div>
      </ThemedStage>
    );
  }

  const solution = solutions[q.id]?.question ?? null;
  const result = solutions[q.id]?.result;
  const hasAnswer = answerGiven(q, answers[q.id]);
  const timerVisible = seconds > 0 && (phase === 'answering' || remaining <= 0);

  return (
    <ThemedStage theme={theme} className="flex flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-3 px-3 py-3 sm:px-6">
        {onExit && (
          <PillButton theme={theme} onClick={onExit} aria-label="Exit">
            <X className="h-5 w-5" />
          </PillButton>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold opacity-80">{title}</div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: `${theme.accent}33` }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: theme.accent }} />
          </div>
        </div>
        <span className="rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums" style={{ background: theme.cardBg }}>
          {index + 1} / {questions.length}
        </span>
        {presenter && (
          <PillButton theme={theme} onClick={toggleFullscreen} aria-label="Toggle fullscreen" className="hidden sm:flex">
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </PillButton>
        )}
      </header>

      <main
        className={cn(
          'mx-auto flex w-full flex-1 flex-col justify-center px-3 pt-2 pb-28 sm:px-6',
          STAGE_WIDTHS[display.width],
          fill && 'sm:justify-start sm:pb-24',
        )}
      >
        <div key={q.id} className={cn('animate-slide-up', fill && 'sm:flex sm:flex-1 sm:flex-col')}>
          <QuestionCard
            fill={fill}
            question={q}
            solution={solution}
            settings={settings}
            answer={answers[q.id]}
            onAnswer={(a: Answer) => setAnswers((s) => ({ ...s, [q.id]: a }))}
            interactive={interactive}
            locked={phase !== 'answering'}
          />
        </div>

        {phase === 'revealed' && interactive && result && (
          <Feedback correct={result.correct} earned={result.earned} max={result.max} />
        )}
        {phase === 'locked' && (
          <div className="mt-5 flex animate-pop items-center justify-center gap-2 text-lg font-semibold">
            {seconds > 0 && remaining <= 0 ? (
              <>
                <IconClock className="h-5 w-5" /> Time's up
              </>
            ) : (
              <>
                <IconCheckCircle className="h-5 w-5" /> Answer locked in
              </>
            )}
          </div>
        )}
        {error && <div className="mt-4 rounded-lg bg-rose-700 px-4 py-3 text-center font-medium text-white">{error}</div>}
      </main>

      {timerVisible && <Timer total={seconds} remaining={remaining} settings={settings.timer} accent={theme.accent} paused={paused} />}

      <footer
        className={cn(
          'fixed inset-x-0 bottom-0 z-20 flex items-center justify-center gap-2 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3',
          timerVisible && settings.timer.position === 'bottom-left' && 'pl-24 sm:pl-40 md:pl-3',
          timerVisible && settings.timer.position === 'bottom-right' && 'pr-24 sm:pr-40 md:pr-3',
        )}
      >
        {presenter ? (
          <>
            <PillButton theme={theme} onClick={prev} disabled={index === 0} aria-label="Previous">
              <ChevronLeft className="h-6 w-6" />
            </PillButton>
            {seconds > 0 && phase === 'answering' && (
              <PillButton theme={theme} onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Resume timer' : 'Pause timer'}>
                {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              </PillButton>
            )}
            {seconds > 0 && phase !== 'answering' && (
              <PillButton theme={theme} onClick={restartTimer} aria-label="Restart timer">
                <RotateCcw className="h-5 w-5" />
              </PillButton>
            )}
            {phase !== 'revealed' && (
              <ActionButton theme={theme} onClick={() => void doReveal(q)} variant="soft">
                <Eye className="h-5 w-5" /> Show answer
              </ActionButton>
            )}
            <ActionButton theme={theme} onClick={next}>
              {isLast ? 'Finish' : 'Next'} <ChevronRight className="h-5 w-5" />
            </ActionButton>
          </>
        ) : phase === 'answering' ? (
          <ActionButton theme={theme} onClick={() => void lock('submit')} disabled={!hasAnswer && seconds === 0} wide>
            {revealAllowed ? 'Check answer' : isLast ? 'Submit quiz' : 'Next'}
            <ChevronRight className="h-5 w-5" />
          </ActionButton>
        ) : (
          <ActionButton theme={theme} onClick={next} disabled={busy} wide>
            {busy ? 'Submitting…' : isLast ? 'See results' : 'Next question'}
            <ChevronRight className="h-5 w-5" />
          </ActionButton>
        )}
      </footer>
    </ThemedStage>
  );
}

function answerGiven(q: Question, a: Answer | undefined): boolean {
  if (a === undefined || a === null) return false;
  if (q.type === 'sequencing') return true;
  if (q.type === 'word_search') return Array.isArray(a) && a.length > 0;
  if (q.type === 'maze') return Array.isArray(a) && a.length > 1;
  if (typeof a === 'boolean') return true;
  if (typeof a === 'string') return a.trim().length > 0;
  if (Array.isArray(a)) return a.some((x) => typeof x === 'string' && x.trim().length > 0);
  return Object.values(a).some(Boolean);
}

function Feedback({ correct, earned, max }: { correct: boolean; earned: number; max: number }) {
  const partial = !correct && earned > 0;
  const Icon = correct ? IconCheckCircle : partial ? IconPartialCircle : IconCrossCircle;
  return (
    <div
      className={cn(
        'mx-auto mt-5 flex animate-pop items-center gap-2.5 rounded-xl px-4 py-2.5 text-base font-semibold text-white',
        correct ? 'bg-emerald-700' : partial ? 'bg-amber-600' : 'bg-rose-700',
      )}
    >
      <Icon className="h-5 w-5" />
      {correct ? 'Correct' : partial ? 'Partly correct' : 'Not quite'}
      <span className="rounded-md bg-white/20 px-2 py-0.5 text-sm tabular-nums">
        +{earned} / {max}
      </span>
    </div>
  );
}

function PillButton({
  theme,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme: QuizSettings['theme'] }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-85 disabled:opacity-40',
        className,
      )}
      style={{ background: theme.cardBg, color: theme.textColor }}
      {...rest}
    />
  );
}

function ActionButton({
  theme,
  variant = 'solid',
  wide,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { theme: QuizSettings['theme']; variant?: 'solid' | 'soft'; wide?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-50',
        wide && 'w-full max-w-sm',
        className,
      )}
      style={variant === 'solid' ? { background: theme.accent, color: '#fff' } : { background: theme.cardBg, color: theme.textColor }}
      {...rest}
    />
  );
}
