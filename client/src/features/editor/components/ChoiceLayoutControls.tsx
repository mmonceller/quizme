import type { ReactNode } from 'react';
import { columnCount } from '@shared/choiceLayout';
import type { ChoiceColumns, ChoiceLabelStyle, ChoiceLayout, ChoiceSize } from '@shared/types';
import { Segmented } from '@/components/ui';
import { ChoiceIcon, SignLetter } from '@/components/icons';

const LABEL_OPTIONS: { value: ChoiceLabelStyle; label: ReactNode }[] = [
  { value: 'letters', label: <span className="tracking-wide">A B C</span> },
  {
    value: 'sign',
    label: (
      <>
        <SignLetter letter="A" className="h-4" /> Sign language
      </>
    ),
  },
  { value: 'both', label: 'Both' },
  {
    value: 'icons',
    label: (
      <>
        <ChoiceIcon icon="triangle" className="h-3.5 w-3.5" /> Icons
      </>
    ),
  },
  { value: 'none', label: 'None' },
];

const SIZE_OPTIONS: { value: ChoiceSize; label: string }[] = [
  { value: 'sm', label: 'Compact' },
  { value: 'md', label: 'Regular' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[132px_1fr] sm:items-center sm:gap-4">
      <div>
        <p className="text-[13px] font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ChoiceLayoutControls({
  layout,
  choiceCount,
  onChange,
}: {
  layout: ChoiceLayout;
  choiceCount: number;
  onChange: (patch: Partial<ChoiceLayout>) => void;
}) {
  const auto = columnCount({ ...layout, columns: 'auto' }, choiceCount);
  const columnOptions: { value: ChoiceColumns; label: string }[] = [
    { value: 'auto', label: `Auto (${auto})` },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
  ];

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <Row label="Choice labels">
        <Segmented value={layout.labels} onChange={(labels) => onChange({ labels })} options={LABEL_OPTIONS} />
      </Row>
      <Row label="Choices per row" hint="On wider screens">
        <Segmented value={layout.columns} onChange={(columns) => onChange({ columns })} options={columnOptions} />
      </Row>
      <Row label="Choice size">
        <Segmented value={layout.size} onChange={(size) => onChange({ size })} options={SIZE_OPTIONS} />
      </Row>
    </div>
  );
}
