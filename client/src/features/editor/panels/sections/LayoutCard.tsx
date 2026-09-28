import { DEFAULT_DISPLAY } from '@shared/defaults';
import type { CardStyle, DisplaySettings, QuizSettings, StageWidth } from '@shared/types';
import { Card, Field, Segmented, Toggle } from '@/components/ui';

const WIDTHS: { value: StageWidth; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'wide', label: 'Wide (90%)' },
  { value: 'full', label: 'Full width' },
];

const CARD_STYLES: { value: CardStyle; label: string }[] = [
  { value: 'card', label: 'Card with border' },
  { value: 'borderless', label: 'No border' },
  { value: 'none', label: 'No card' },
];

export function LayoutCard({ settings, onChange }: { settings: QuizSettings; onChange: (patch: Partial<QuizSettings>) => void }) {
  const display = { ...DEFAULT_DISPLAY, ...settings.display };
  const set = (patch: Partial<DisplaySettings>) => onChange({ display: { ...display, ...patch } });

  return (
    <Card title="Layout" description="How much of the screen each question uses and what surrounds it.">
      <div className="space-y-5">
        <Field label="Question width on desktop" hint="Text and choices scale up to fill the space.">
          <Segmented value={display.width} onChange={(width) => set({ width })} options={WIDTHS} />
        </Field>
        <Field label="Question container">
          <Segmented value={display.cardStyle} onChange={(cardStyle) => set({ cardStyle })} options={CARD_STYLES} />
        </Field>
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <Toggle checked={display.choiceBorders} onChange={(choiceBorders) => set({ choiceBorders })} label="Borders around choices" description="Selected and revealed answers are always outlined." />
          <Toggle checked={display.showQuestionType} onChange={(showQuestionType) => set({ showQuestionType })} label="Show question type" description="The small label above the question, like “Multiple choice”." />
          <Toggle checked={display.showPoints} onChange={(showPoints) => set({ showPoints })} label="Show points" description="How many points the question is worth." />
        </div>
      </div>
    </Card>
  );
}
