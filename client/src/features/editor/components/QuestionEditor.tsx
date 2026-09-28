import { useState } from 'react';
import { ChevronDown, Copy, Paintbrush, Timer as TimerIcon, Trash2 } from 'lucide-react';
import type { Question, QuizSettings } from '@shared/types';
import { Field, Input, Select, Textarea, Toggle } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TypeEditor } from '../questionEditors/TypeEditor';
import { ImageUpload } from './ImageUpload';
import { StyleEditor } from './StyleEditor';
import { typeMeta } from './questionTypes';
import { questionWarning } from '../state/questionWarnings';
import { IconAlert } from '@/components/icons';

interface Props {
  question: Question;
  index: number;
  settings: QuizSettings;
  onChange: (patch: Partial<Question>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function QuestionEditor({ question: q, index, settings, onChange, onDuplicate, onDelete }: Props) {
  const meta = typeMeta(q.type);
  const warning = questionWarning(q);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600">
            <meta.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-500">Question {index + 1}</div>
            <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
          </div>
          <button onClick={onDuplicate} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Duplicate question" aria-label="Duplicate question">
            <Copy className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700" title="Delete question" aria-label="Delete question">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <Field label={q.type === 'fill_blank' ? 'Instructions (optional)' : 'Question'}>
            <Textarea
              value={q.prompt}
              onChange={(e) => onChange({ prompt: e.target.value })}
              placeholder={q.type === 'true_false' ? 'e.g. The Earth is flat.' : 'Type your question here…'}
              className="min-h-[80px] text-[15px]"
            />
          </Field>
          <ImageUpload value={q.image} onChange={(image) => onChange({ image })} label="Add image to question" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Answer</h3>
        <TypeEditor q={q} onChange={onChange} />
        {warning && (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <IconAlert className="h-4 w-4 shrink-0" /> {warning}
          </p>
        )}
      </div>

      <QuestionOptions q={q} settings={settings} onChange={onChange} />
    </div>
  );
}

function Collapsible({ icon, title, summary, children }: { icon: React.ReactNode; title: string; summary: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-6">
        <span className="text-slate-400">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-900">{title}</span>
          <span className="block truncate text-[13px] text-slate-500">{summary}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', open && 'rotate-180')} />
      </button>
      {open && <div className="border-t border-slate-100 px-4 py-5 sm:px-6">{children}</div>}
    </div>
  );
}

function QuestionOptions({ q, settings, onChange }: { q: Question; settings: QuizSettings; onChange: (p: Partial<Question>) => void }) {
  const timerMode = q.timerSeconds === null ? 'default' : q.timerSeconds === 0 ? 'none' : 'custom';
  const timerSummary = !settings.timer.enabled
    ? 'Timer is off for this quiz'
    : timerMode === 'default'
      ? `Quiz default (${settings.timer.defaultSeconds}s)`
      : timerMode === 'none'
        ? 'No timer'
        : `${q.timerSeconds}s`;
  const revealSummary = q.revealAnswer === 'inherit' ? `Quiz default (${settings.revealAnswers ? 'show' : 'hide'})` : q.revealAnswer === 'show' ? 'Show' : 'Hide';

  return (
    <>
      <Collapsible icon={<TimerIcon className="h-4 w-4" />} title="Points, timer & answer reveal" summary={`${q.points} pt · ${timerSummary} · Reveal: ${revealSummary}`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Points">
            <Input type="number" min={0} max={100} step={0.5} value={q.points} onChange={(e) => onChange({ points: Math.max(0, Number(e.target.value) || 0) })} />
          </Field>
          <Field label="Show correct answer after timer" hint="Override for harder or trickier questions">
            <Select value={q.revealAnswer} onChange={(e) => onChange({ revealAnswer: e.target.value as Question['revealAnswer'] })}>
              <option value="inherit">Use quiz setting ({settings.revealAnswers ? 'show' : 'hide'})</option>
              <option value="show">Always show</option>
              <option value="hide">Never show</option>
            </Select>
          </Field>
          <Field
            label="Timer for this question"
            hint={settings.timer.enabled ? undefined : 'Turn on the timer in the Settings tab to use this.'}
            className="sm:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
              <Select
                value={timerMode}
                disabled={!settings.timer.enabled}
                onChange={(e) => {
                  const m = e.target.value;
                  onChange({ timerSeconds: m === 'default' ? null : m === 'none' ? 0 : settings.timer.defaultSeconds });
                }}
                className="w-auto flex-1"
              >
                <option value="default">Quiz default ({settings.timer.defaultSeconds}s)</option>
                <option value="custom">Custom time</option>
                <option value="none">No timer</option>
              </Select>
              {timerMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={3}
                    max={3600}
                    value={q.timerSeconds ?? 30}
                    disabled={!settings.timer.enabled}
                    onChange={(e) => onChange({ timerSeconds: Math.max(3, Math.min(3600, Number(e.target.value) || 3)) })}
                    className="w-24"
                  />
                  <span className="text-sm text-slate-500">seconds</span>
                </div>
              )}
            </div>
          </Field>
        </div>
      </Collapsible>

      <Collapsible
        icon={<Paintbrush className="h-4 w-4" />}
        title="Text style for this question"
        summary={q.questionStyle || q.choiceStyle ? 'Custom style' : 'Using quiz style (change it in the Design tab)'}
      >
        <div className="space-y-6">
          <div>
            <Toggle
              checked={!!q.questionStyle}
              onChange={(on) => onChange({ questionStyle: on ? { ...settings.questionStyle } : undefined })}
              label="Custom question text style"
            />
            {q.questionStyle && (
              <div className="mt-3">
                <StyleEditor value={{ ...settings.questionStyle, ...q.questionStyle }} onChange={(questionStyle) => onChange({ questionStyle })} />
              </div>
            )}
          </div>
          <div>
            <Toggle
              checked={!!q.choiceStyle}
              onChange={(on) => onChange({ choiceStyle: on ? { ...settings.choiceStyle } : undefined })}
              label="Custom answer/choice text style"
            />
            {q.choiceStyle && (
              <div className="mt-3">
                <StyleEditor value={{ ...settings.choiceStyle, ...q.choiceStyle }} onChange={(choiceStyle) => onChange({ choiceStyle })} />
              </div>
            )}
          </div>
        </div>
      </Collapsible>
    </>
  );
}
