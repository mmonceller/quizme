import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import type { TextStyle } from '@shared/types';
import { Select } from '@/components/ui';
import { FONT_OPTIONS, fontStack } from '@/lib/fonts';
import { cn } from '@/lib/utils';

const COLOR_SWATCHES = ['#0f172a', '#ffffff', '#6366f1', '#ec4899', '#ef4444', '#f97316', '#eab308', '#16a34a', '#0891b2', '#7c3aed'];

export function StyleEditor({ value, onChange }: { value: TextStyle; onChange: (v: TextStyle) => void }) {
  const set = <K extends keyof TextStyle>(k: K, v: TextStyle[K]) => onChange({ ...value, [k]: v });

  const toggle = (active: boolean, onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn('flex h-9 w-9 items-center justify-center rounded-md border transition-colors', active ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50')}
    >
      {icon}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Select
          value={value.fontFamily}
          onChange={(e) => set('fontFamily', e.target.value)}
          style={{ fontFamily: value.fontFamily === 'inherit' ? undefined : fontStack(value.fontFamily) }}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value === 'inherit' ? undefined : fontStack(f.value) }}>
              {f.label}
            </option>
          ))}
        </Select>
        <div className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2">
          <input
            type="number"
            min={10}
            max={96}
            value={value.fontSize}
            onChange={(e) => set('fontSize', Math.min(96, Math.max(10, Number(e.target.value) || 10)))}
            className="w-12 bg-transparent text-center font-semibold outline-none"
            aria-label="Font size"
          />
          <span className="text-xs text-slate-400">px</span>
        </div>
      </div>
      <input
        type="range"
        min={12}
        max={72}
        value={value.fontSize}
        onChange={(e) => set('fontSize', Number(e.target.value))}
        className="w-full accent-brand-600"
        aria-label="Font size slider"
      />
      <div className="flex flex-wrap items-center gap-1.5">
        {toggle(value.bold, () => set('bold', !value.bold), <Bold className="h-4 w-4" />, 'Bold')}
        {toggle(value.italic, () => set('italic', !value.italic), <Italic className="h-4 w-4" />, 'Italic')}
        {toggle(value.underline, () => set('underline', !value.underline), <Underline className="h-4 w-4" />, 'Underline')}
        <span className="mx-1 h-6 w-px bg-slate-200" />
        {toggle(value.align === 'left', () => set('align', 'left'), <AlignLeft className="h-4 w-4" />, 'Align left')}
        {toggle(value.align === 'center', () => set('align', 'center'), <AlignCenter className="h-4 w-4" />, 'Align center')}
        {toggle(value.align === 'right', () => set('align', 'right'), <AlignRight className="h-4 w-4" />, 'Align right')}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => set('color', null)}
          className={cn('h-8 rounded-full border px-3 text-xs font-medium', value.color === null ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white text-slate-600')}
        >
          Theme color
        </button>
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => set('color', c)}
            style={{ background: c }}
            className={cn('h-8 w-8 rounded-full border border-slate-200', value.color === c && 'ring-2 ring-brand-600 ring-offset-2')}
            aria-label={c}
          />
        ))}
        <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-slate-200 bg-[conic-gradient(red,yellow,lime,aqua,blue,magenta,red)]" title="Custom color">
          <input type="color" value={value.color ?? '#000000'} onChange={(e) => set('color', e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
      </div>
    </div>
  );
}
