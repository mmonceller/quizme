import { useState } from 'react';
import { Circle, Upload } from 'lucide-react';
import type { MazeMarker } from '@shared/types';
import { Modal, Segmented } from '@/components/ui';
import { MARKER_GROUPS, MARKER_PRESETS, MarkerArt, type MarkerGroup } from '@/components/puzzles/maze/markers';
import { cn } from '@/lib/utils';
import { ImageUpload } from '../../components/ImageUpload';

type Tab = MarkerGroup | 'upload';

const TABS: { value: Tab; label: string }[] = [
  ...MARKER_GROUPS.map((g) => ({ value: g.group as Tab, label: g.label })),
  { value: 'upload', label: 'Upload' },
];

function initialTab(marker: MazeMarker, fallback: MarkerGroup): Tab {
  if (marker.type === 'image') return 'upload';
  if (marker.type === 'preset') return MARKER_PRESETS.find((p) => p.id === marker.id)?.group ?? fallback;
  return fallback;
}

export function MarkerPickerModal({
  open,
  onClose,
  title,
  value,
  ring,
  defaultGroup,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  value: MazeMarker;
  ring: string;
  defaultGroup: MarkerGroup;
  onChange: (marker: MazeMarker) => void;
}) {
  const [tab, setTab] = useState<Tab>(() => initialTab(value, defaultGroup));
  const pick = (marker: MazeMarker) => {
    onChange(marker);
    onClose();
  };
  const selected = (m: MazeMarker) =>
    m.type === value.type && (m.type !== 'preset' || (value.type === 'preset' && value.id === m.id));

  return (
    <Modal open={open} onClose={onClose} title={title} description="Pick a picture or upload your own." size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Segmented value={tab} onChange={setTab} options={TABS} />
          <button
            type="button"
            onClick={() => pick({ type: 'dot' })}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium',
              value.type === 'dot' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600 hover:text-slate-900',
            )}
          >
            <Circle className="h-3.5 w-3.5" fill={ring} stroke={ring} /> Plain dot
          </button>
        </div>

        {tab === 'upload' ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 p-6 text-center">
            {value.type === 'image' && <MarkerArt marker={value} ring={ring} className="h-24 w-24" />}
            <ImageUpload
              value={null}
              onChange={(url) => url && pick({ type: 'image', url })}
              label={value.type === 'image' ? 'Replace image' : 'Upload image'}
            />
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Upload className="h-3.5 w-3.5" /> Square photos or drawings work best; they are cropped to a circle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {MARKER_PRESETS.filter((p) => p.group === tab).map((p) => {
              const marker: MazeMarker = { type: 'preset', id: p.id };
              const active = selected(marker);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pick(marker)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-2 text-xs font-medium transition-colors',
                    active ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  <MarkerArt marker={marker} ring={ring} className="h-16 w-16" />
                  <span className="text-center leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
