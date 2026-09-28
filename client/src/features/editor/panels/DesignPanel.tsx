import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Question, QuizSettings, Theme } from '@shared/types';
import { BACKGROUND_GRADIENTS, BACKGROUND_PALETTE, THEME_PRESETS, themeFromPreset } from '@shared/themes';
import { Card, Segmented, Select } from '@/components/ui';
import { FONT_OPTIONS, fontStack } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { ThemeThumb } from '@/features/library/components/ThemeThumb';
import { ImageUpload } from '../components/ImageUpload';
import { StyleEditor } from '../components/StyleEditor';
import { LivePreview } from '../components/LivePreview';
import { LayoutCard } from './sections/LayoutCard';

interface Props {
  settings: QuizSettings;
  onChange: (patch: Partial<QuizSettings>) => void;
  sampleQuestion: Question | undefined;
}

export function DesignPanel({ settings, onChange, sampleQuestion }: Props) {
  const theme = settings.theme;
  const setTheme = (patch: Partial<Theme>) => onChange({ theme: { ...theme, ...patch } });
  const [bgTab, setBgTab] = useState<'color' | 'gradient' | 'image'>(theme.backgroundImage ? 'image' : 'color');

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <Card title="Theme">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {THEME_PRESETS.map((p) => {
              const active = theme.presetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange({ theme: themeFromPreset(p) })}
                  className={cn('group overflow-hidden rounded-lg border text-left transition-colors', active ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200 hover:border-slate-300')}
                >
                  <div className="relative">
                    <ThemeThumb theme={themeFromPreset(p)} className="h-20" />
                    {active && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-brand-700 p-1 text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <div className="border-t border-slate-100 bg-white px-2.5 py-2 text-[13px] font-medium text-slate-700" style={{ fontFamily: fontStack(p.fontFamily) }}>
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <LayoutCard settings={settings} onChange={onChange} />

        <Card title="Background">
          <Segmented
            value={bgTab}
            onChange={setBgTab}
            options={[
              { value: 'color', label: 'Color' },
              { value: 'gradient', label: 'Gradient' },
              { value: 'image', label: 'Image' },
            ]}
            className="mb-4"
          />
          {bgTab === 'color' && (
            <div>
              <div className="grid grid-cols-10 gap-1.5">
                {BACKGROUND_PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTheme({ background: c, backgroundImage: null })}
                    style={{ background: c }}
                    className={cn('aspect-square rounded-md border border-slate-200 transition-transform hover:scale-105', !theme.backgroundImage && theme.background === c && 'ring-2 ring-brand-600 ring-offset-2')}
                    aria-label={c}
                  />
                ))}
              </div>
              <label className="mt-4 flex w-fit cursor-pointer items-center gap-3 text-[13px] font-medium text-slate-700">
                <input
                  type="color"
                  value={theme.background.startsWith('#') ? theme.background : '#ffffff'}
                  onChange={(e) => setTheme({ background: e.target.value, backgroundImage: null })}
                  className="h-9 w-12 cursor-pointer rounded-md border border-slate-200"
                />
                Custom color
              </label>
            </div>
          )}
          {bgTab === 'gradient' && (
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_GRADIENTS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setTheme({ background: g, backgroundImage: null })}
                  style={{ background: g }}
                  className={cn('aspect-video rounded-md transition-transform hover:scale-105', !theme.backgroundImage && theme.background === g && 'ring-2 ring-brand-600 ring-offset-2')}
                  aria-label="Gradient"
                />
              ))}
            </div>
          )}
          {bgTab === 'image' && (
            <div className="space-y-4">
              <ImageUpload value={theme.backgroundImage} onChange={(backgroundImage) => setTheme({ backgroundImage })} label="Upload background image" />
              {theme.backgroundImage && (
                <label className="block">
                  <span className="mb-1 block text-[13px] font-medium text-slate-700">Darken image ({Math.round(theme.overlay * 100)}%)</span>
                  <span className="mb-2 block text-xs text-slate-500">Makes text easier to read on busy pictures.</span>
                  <input type="range" min={0} max={0.85} step={0.05} value={theme.overlay} onChange={(e) => setTheme({ overlay: Number(e.target.value) })} className="w-full accent-brand-600" />
                </label>
              )}
            </div>
          )}
        </Card>

        <Card title="Colors & base font">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorInput label="Accent (buttons, highlights)" value={theme.accent} onChange={(accent) => setTheme({ accent })} />
            <ColorInput label="Main text" value={theme.textColor} onChange={(textColor) => setTheme({ textColor })} />
            <ColorInput label="Choice text" value={theme.choiceText} onChange={(choiceText) => setTheme({ choiceText })} />
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Base font</span>
              <Select value={theme.fontFamily} onChange={(e) => setTheme({ fontFamily: e.target.value })} style={{ fontFamily: fontStack(theme.fontFamily) }}>
                {FONT_OPTIONS.filter((f) => f.value !== 'inherit').map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Question text">
            <StyleEditor value={settings.questionStyle} onChange={(questionStyle) => onChange({ questionStyle })} />
          </Card>
          <Card title="Choices & answers text">
            <StyleEditor value={settings.choiceStyle} onChange={(choiceStyle) => onChange({ choiceStyle })} />
          </Card>
        </div>
      </div>

      <div className="xl:sticky xl:top-32 xl:self-start">
        <LivePreview question={sampleQuestion} settings={settings} />
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000';
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-slate-700">{label}</span>
      <span className="flex h-10 items-center gap-3 rounded-lg border border-slate-300 bg-white px-2">
        <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded" />
        <span className="font-mono text-[13px] uppercase text-slate-500">{value}</span>
      </span>
    </label>
  );
}
