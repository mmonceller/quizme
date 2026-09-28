import { useEffect, useRef, useState } from 'react';
import { CHOICE_ICON_KEYS, choiceIconFor } from '@shared/choiceLayout';
import { CHOICE_ICON_LABELS, ChoiceIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export function ChoiceIconPicker({ value, index, onChange }: { value?: string | null; index: number; onChange: (icon: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = choiceIconFor(value, index);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-slate-700 transition-colors hover:border-slate-400',
          open ? 'border-brand-500 ring-2 ring-brand-500/15' : 'border-slate-300',
        )}
        aria-label={`Choice icon: ${CHOICE_ICON_LABELS[current]}`}
        title="Change icon"
      >
        <ChoiceIcon icon={value} index={index} className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-[216px] animate-pop rounded-lg border border-slate-200 bg-white p-2 shadow-lg shadow-slate-900/8">
          <div className="grid grid-cols-4 gap-1">
            {CHOICE_ICON_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key);
                  setOpen(false);
                }}
                className={cn(
                  'flex h-11 items-center justify-center rounded-md transition-colors',
                  key === current ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300' : 'text-slate-600 hover:bg-slate-100',
                )}
                aria-label={CHOICE_ICON_LABELS[key]}
                title={CHOICE_ICON_LABELS[key]}
              >
                <ChoiceIcon icon={key} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
