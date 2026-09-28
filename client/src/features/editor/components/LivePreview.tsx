import { useEffect, useState } from 'react';
import type { Answer, Question, QuizSettings, StageWidth } from '@shared/types';
import { effectiveSeconds } from '@shared/rules';
import { QuestionCard } from '@/features/player/components/QuestionCard';
import { Timer } from '@/features/player/components/Timer';
import { themeBackgroundStyle } from '@/features/player/theme/themeStyles';
import { Segmented } from '@/components/ui';
import { prepareQuestions } from '@/features/player/engine/prepare';
import { resolveDisplay } from '@/features/player/theme/DisplayContext';
import { cn } from '@/lib/utils';

/** Share of a desktop screen the question takes up, mirrored in the preview frame. */
const PREVIEW_WIDTHS: Record<StageWidth, string> = { standard: 'max-w-[62%]', wide: 'max-w-[90%]', full: 'max-w-full' };

/** Scaled-down live rendering of a question exactly as players will see it. */
export function LivePreview({ question, settings }: { question: Question | undefined; settings: QuizSettings }) {
  const [view, setView] = useState<'question' | 'answer'>('question');
  const [answer, setAnswer] = useState<Answer | undefined>(undefined);
  const [display, setDisplay] = useState<Question | undefined>(question);

  useEffect(() => {
    setAnswer(undefined);
    setDisplay(question ? prepareQuestions([question], { ...settings, shuffleChoices: false }, false)[0] : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const seconds = question ? effectiveSeconds(question, settings) : 0;
  const timerCorner = {
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3',
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
  }[settings.timer.position];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium uppercase tracking-wider text-slate-500">Preview</span>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'question', label: 'Question' },
            { value: 'answer', label: 'Answer' },
          ]}
        />
      </div>
      <div
        className="relative flex min-h-72 flex-col justify-center overflow-hidden rounded-xl border border-slate-200 px-2 pt-6 pb-16"
        style={{ ...themeBackgroundStyle(settings.theme), color: settings.theme.textColor }}
      >
        {display && question ? (
          <div className={cn('mx-auto w-full', PREVIEW_WIDTHS[resolveDisplay(settings).width])}>
            <QuestionCard
              question={display}
              solution={view === 'answer' ? question : null}
              settings={settings}
              answer={answer}
              onAnswer={setAnswer}
              interactive={settings.interactive}
              locked={view === 'answer'}
            />
          </div>
        ) : (
          <div className="flex h-60 items-center justify-center text-center font-semibold opacity-70">Add a question to see it here</div>
        )}
        {seconds > 0 && (
          <div className={`absolute ${timerCorner} origin-bottom scale-75`}>
            <Timer inline total={seconds} remaining={seconds * 0.65} settings={settings.timer} accent={settings.theme.accent} />
          </div>
        )}
      </div>
      <p className="mt-2.5 text-center text-xs text-slate-500">
        {settings.interactive ? 'Try answering. This is how participants will see it.' : 'Presentation mode: answers are not collected.'}
      </p>
    </div>
  );
}
