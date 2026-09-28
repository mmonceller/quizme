import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import type { Theme } from '@shared/types';
import { isLight } from '@/lib/color';
import { cn } from '@/lib/utils';
import { CORRECT, WRONG } from './types';

export interface SelectOption {
  value: string;
  label: string;
  /** shown as a small badge, e.g. A, B, C */
  tag?: string;
}

interface Placement {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
  font: Pick<CSSProperties, 'fontFamily' | 'fontSize' | 'fontWeight' | 'fontStyle'>;
}

/** Dropdown styled from the quiz theme. The list renders in a portal so preview frames can't clip it. */
export function ThemedSelect({
  value,
  options,
  onChange,
  theme,
  disabled,
  status,
  placeholder = 'Choose…',
  ariaLabel,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  theme: Theme;
  disabled?: boolean;
  status?: 'correct' | 'wrong' | null;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<Placement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const darkText = isLight(theme.choiceBg);
  const base = darkText ? '#ffffff' : '#141225';
  const border = status === 'correct' ? CORRECT : status === 'wrong' ? WRONG : open ? theme.accent : `${theme.accent}55`;

  const measure = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const below = window.innerHeight - r.bottom;
    const up = below < 220 && r.top > below;
    setPlace({
      left: r.left,
      width: Math.max(r.width, 200),
      ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
      maxHeight: Math.min(340, (up ? r.top : below) - 16),
      font: { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, fontStyle: cs.fontStyle },
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if ((e.key === 'Enter' || e.key === ' ') && options[active]) {
      e.preventDefault();
      pick(options[active].value);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center gap-[0.5em] rounded-[0.75em] border-2 px-[0.7em] py-[0.45em] text-left transition-colors outline-none disabled:cursor-default"
        style={{ borderColor: border, background: `${theme.accent}10`, color: 'inherit', font: 'inherit', boxShadow: open ? `0 0 0 3px ${theme.accent}26` : undefined }}
      >
        {selected?.tag && <Tag theme={theme} filled>{selected.tag}</Tag>}
        <span className={cn('min-w-0 flex-1 truncate', !selected && 'opacity-55')}>{selected?.label ?? placeholder}</span>
        {!disabled && <ChevronDown className={cn('h-[1em] w-[1em] shrink-0 transition-transform', open && 'rotate-180')} style={{ color: theme.accent }} strokeWidth={2.5} />}
      </button>

      {open &&
        place &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            className="fixed z-[70] animate-pop overflow-y-auto rounded-[0.9em] p-[0.3em] shadow-2xl"
            style={{
              left: place.left,
              width: place.width,
              top: place.top,
              bottom: place.bottom,
              maxHeight: place.maxHeight,
              ...place.font,
              background: `linear-gradient(${theme.choiceBg}, ${theme.choiceBg}), ${base}`,
              color: theme.choiceText,
              border: `1px solid ${theme.accent}40`,
            }}
          >
            {options.length === 0 ? (
              <div className="px-[0.7em] py-[0.6em] text-[0.85em] opacity-60">Every answer is already used</div>
            ) : (
              options.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <button
                    key={`${o.value}-${i}`}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    data-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(o.value)}
                    className="flex w-full items-center gap-[0.55em] rounded-[0.6em] px-[0.6em] py-[0.45em] text-left"
                    style={{ background: i === active ? `${theme.accent}1f` : 'transparent' }}
                  >
                    {o.tag && <Tag theme={theme} filled={isSel}>{o.tag}</Tag>}
                    <span className="min-w-0 flex-1">{o.label}</span>
                    {isSel && <Check className="h-[1em] w-[1em] shrink-0" style={{ color: theme.accent }} strokeWidth={3} />}
                  </button>
                );
              })
            )}
            {value && (
              <button
                type="button"
                onClick={() => pick('')}
                className="mt-[0.2em] flex w-full items-center gap-[0.5em] rounded-[0.6em] border-t px-[0.6em] py-[0.45em] text-left text-[0.8em] opacity-70 hover:opacity-100"
                style={{ borderColor: `${theme.accent}26` }}
              >
                <X className="h-[1em] w-[1em]" /> Clear choice
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function Tag({ theme, filled, children }: { theme: Theme; filled?: boolean; children: string }) {
  return (
    <span
      className="flex h-[1.6em] min-w-[1.6em] shrink-0 items-center justify-center rounded-[0.45em] px-[0.3em] text-[0.75em] leading-none font-bold"
      style={filled ? { background: theme.accent, color: '#fff' } : { background: `${theme.accent}22`, color: theme.accent }}
    >
      {children}
    </span>
  );
}
