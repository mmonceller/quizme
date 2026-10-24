import { useState } from 'react';
import type { MazeMarker } from '@shared/types';
import { MarkerArt, markerPreset, type MarkerGroup } from '@/components/puzzles/maze/markers';
import { MarkerPickerModal } from './MarkerPickerModal';

function markerLabel(marker: MazeMarker): string {
  if (marker.type === 'image') return 'Uploaded image';
  if (marker.type === 'preset') return markerPreset(marker.id)?.label ?? 'Picture';
  return 'Plain dot';
}

export function MarkerPicker({
  label,
  value,
  ring,
  defaultGroup,
  onChange,
}: {
  label: string;
  value: MazeMarker;
  ring: string;
  defaultGroup: MarkerGroup;
  onChange: (marker: MazeMarker) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-1.5 pr-3 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        <MarkerArt marker={value} ring={ring} className="h-10 w-10 shrink-0" />
        <span className="min-w-0">
          <span className="block text-xs text-slate-500">{label}</span>
          <span className="block truncate text-[13px] font-medium text-slate-800">{markerLabel(value)}</span>
        </span>
      </button>
      {open && (
        <MarkerPickerModal
          open
          onClose={() => setOpen(false)}
          title={`${label} picture`}
          value={value}
          ring={ring}
          defaultGroup={defaultGroup}
          onChange={onChange}
        />
      )}
    </>
  );
}
