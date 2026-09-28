import { DEFAULT_END_SCREEN } from '@shared/defaults';
import type { EndScreenSettings, QuizSettings } from '@shared/types';
import { Card, Field, Input, Textarea, Toggle } from '@/components/ui';

export function EndScreenCard({ settings, onChange }: { settings: QuizSettings; onChange: (patch: Partial<QuizSettings>) => void }) {
  const end = { ...DEFAULT_END_SCREEN, ...settings.endScreen };
  const set = (patch: Partial<EndScreenSettings>) => onChange({ endScreen: { ...end, ...patch } });

  return (
    <Card title="End of quiz" description="What participants see after the last question.">
      <div className="space-y-5">
        <Field label="Headline" hint="Leave empty to use an automatic headline based on the score, like “Great job”.">
          <Input value={end.title} onChange={(e) => set({ title: e.target.value })} maxLength={120} placeholder="Automatic" />
        </Field>
        <Field label="Message (optional)">
          <Textarea value={end.message} onChange={(e) => set({ message: e.target.value })} maxLength={1000} placeholder="Thanks for playing! Results will be announced on Friday." />
        </Field>
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <Toggle checked={end.showScore} onChange={(showScore) => set({ showScore })} label="Show the score" description="Percentage and points earned." />
          <Toggle checked={end.showBreakdown} onChange={(showBreakdown) => set({ showBreakdown })} label="Show results per question" description="A row of numbered markers showing which questions were right or wrong." />
          <Toggle checked={end.allowReview} onChange={(allowReview) => set({ allowReview })} label="Allow reviewing answers" description="Lets you step through each question with the correct answers (when you play your own quiz)." />
          <Toggle checked={end.allowReplay} onChange={(allowReplay) => set({ allowReplay })} label="Show “Start over” button" description="Not available on public links, where each person answers once." />
        </div>
      </div>
    </Card>
  );
}
