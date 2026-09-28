import { useState } from 'react';
import type { QuizSettings, TimerPosition, TimerSettings, TimerSize, TimerStyle } from '@shared/types';
import { Card, Field, Input, Segmented, Textarea, Toggle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Timer } from '@/features/player/components/Timer';
import { useCountdown } from '@/features/player/engine/useCountdown';
import { EndScreenCard } from './sections/EndScreenCard';

interface Props {
  title: string;
  description: string;
  settings: QuizSettings;
  onDetails: (patch: { title?: string; description?: string }) => void;
  onChange: (patch: Partial<QuizSettings>) => void;
}

const TIMER_STYLES: { value: TimerStyle; label: string }[] = [
  { value: 'ring', label: 'Ring' },
  { value: 'bar', label: 'Bar' },
  { value: 'digital', label: 'Digital' },
  { value: 'bubble', label: 'Bubble' },
];
const POSITIONS: { value: TimerPosition; label: string }[] = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
];
const TIMER_COLORS = [null, '#3a5196', '#9b3f6b', '#b8652a', '#2f7a6d', '#2d6f8f', '#1f2937'];
const QUICK_SECONDS = [10, 15, 20, 30, 45, 60, 90, 120];

export function SettingsPanel({ title, description, settings, onDetails, onChange }: Props) {
  const timer = settings.timer;
  const setTimer = (patch: Partial<TimerSettings>) => onChange({ timer: { ...timer, ...patch } });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card title="Quiz details">
        <div className="space-y-4">
          <Field label="Name">
            <Input value={title} onChange={(e) => onDetails({ title: e.target.value })} maxLength={150} />
          </Field>
          <Field label="Description (optional)">
            <Textarea value={description} onChange={(e) => onDetails({ description: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="How the quiz is played">
        <div className="space-y-5">
          <Toggle
            checked={settings.interactive}
            onChange={(interactive) => onChange({ interactive })}
            label="Interactive (accept answers)"
            description="Turn off for presentations, classrooms where students answer on paper, or group games on a big screen. Public participant links always accept answers."
          />
          <Toggle
            checked={settings.revealAnswers}
            onChange={(revealAnswers) => onChange({ revealAnswers })}
            label="Show the correct answer after each question"
            description="Revealed when the timer ends (or when the answer is submitted). You can override this per question."
          />
          <Toggle checked={settings.shuffleQuestions} onChange={(shuffleQuestions) => onChange({ shuffleQuestions })} label="Shuffle question order" />
          <Toggle checked={settings.shuffleChoices} onChange={(shuffleChoices) => onChange({ shuffleChoices })} label="Shuffle multiple-choice options" />
        </div>
      </Card>

      <Card title="Timer">
        <Toggle
          checked={timer.enabled}
          onChange={(enabled) => setTimer({ enabled })}
          label="Use a countdown timer"
          description="Set a default time for every question. You can give harder questions more (or less) time in each question's options."
        />
        {timer.enabled && (
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px]">
            <div className="space-y-5">
              <Field label="Default time per question">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SECONDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTimer({ defaultSeconds: s })}
                      className={cn('h-9 rounded-md border px-3 text-[13px] font-medium tabular-nums transition-colors', timer.defaultSeconds === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}
                    >
                      {s < 60 ? `${s}s` : `${s / 60}m`}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={3}
                      max={3600}
                      value={timer.defaultSeconds}
                      onChange={(e) => setTimer({ defaultSeconds: Math.max(3, Math.min(3600, Number(e.target.value) || 3)) })}
                      className="h-9 w-20"
                    />
                    <span className="text-sm text-slate-500">sec</span>
                  </div>
                </div>
              </Field>
              <Field label="Look">
                <Segmented value={timer.style} onChange={(style) => setTimer({ style })} options={TIMER_STYLES} />
              </Field>
              <Field label="Size">
                <Segmented<TimerSize>
                  value={timer.size}
                  onChange={(size) => setTimer({ size })}
                  options={[
                    { value: 'sm', label: 'Small' },
                    { value: 'md', label: 'Medium' },
                    { value: 'lg', label: 'Large' },
                  ]}
                />
              </Field>
              <Field label="Position on screen">
                <div className="grid w-48 grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100/70 p-1">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setTimer({ position: p.value })}
                      className={cn('h-11 rounded-md text-xs font-medium transition-colors', timer.position === p.value ? 'bg-brand-700 text-white' : 'bg-white text-slate-500 hover:text-slate-800')}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Color">
                <div className="flex flex-wrap items-center gap-2">
                  {TIMER_COLORS.map((c) => (
                    <button
                      key={c ?? 'theme'}
                      type="button"
                      onClick={() => setTimer({ color: c })}
                      style={c ? { background: c } : undefined}
                      className={cn(
                        'h-8 rounded-full border border-slate-200 transition',
                        c ? 'w-8' : 'bg-white px-3 text-xs font-medium text-slate-600',
                        timer.color === c && 'ring-2 ring-brand-600 ring-offset-2',
                      )}
                    >
                      {!c && 'Theme'}
                    </button>
                  ))}
                  <input type="color" value={timer.color ?? '#3a5196'} onChange={(e) => setTimer({ color: e.target.value })} className="h-8 w-11 cursor-pointer rounded-md" />
                </div>
              </Field>
              <Toggle
                checked={timer.autoAdvance}
                onChange={(autoAdvance) => setTimer({ autoAdvance })}
                label="Go to the next question automatically"
                description="When time runs out (after showing the answer, if enabled)."
              />
            </div>
            <TimerDemo timer={timer} accent={settings.theme.accent} />
          </div>
        )}
      </Card>

      <EndScreenCard settings={settings} onChange={onChange} />
    </div>
  );
}

function TimerDemo({ timer, accent }: { timer: TimerSettings; accent: string }) {
  const [round, setRound] = useState(0);
  const remaining = useCountdown(10, true, String(round), () => setTimeout(() => setRound((r) => r + 1), 800));
  const corner = {
    'bottom-left': 'items-end justify-start',
    'bottom-right': 'items-end justify-end',
    'top-left': 'items-start justify-start',
    'top-right': 'items-start justify-end',
  }[timer.position];

  return (
    <div>
      <div className="mb-2 text-[13px] font-medium text-slate-700">Preview</div>
      <div className={cn('flex aspect-[3/4] rounded-lg border border-slate-200 bg-slate-100 p-3 md:aspect-auto md:h-80', corner)}>
        <div className="origin-center scale-90">
          <Timer inline total={10} remaining={remaining} settings={timer} accent={accent} />
        </div>
      </div>
    </div>
  );
}
