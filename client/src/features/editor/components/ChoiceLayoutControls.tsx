import type { ReactNode } from 'react';
import { columnCount } from '@shared/choiceLayout';
import type { ChoiceColumns, ChoiceLabelStyle, ChoiceLayout, ChoiceSize } from '@shared/types';
import { Segmented } from '@/components/ui';
import { ChoiceIcon, SignLetter } from '@/components/icons';
import { SettingRow } from './SettingRow';

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
      <SettingRow label="Choice labels">
        <Segmented value={layout.labels} onChange={(labels) => onChange({ labels })} options={LABEL_OPTIONS} />
      </SettingRow>
      <SettingRow label="Choices per row" hint="On wider screens">
        <Segmented value={layout.columns} onChange={(columns) => onChange({ columns })} options={columnOptions} />
      </SettingRow>
      <SettingRow label="Choice size">
        <Segmented value={layout.size} onChange={(size) => onChange({ size })} options={SIZE_OPTIONS} />
      </SettingRow>
    </div>
  );
}
