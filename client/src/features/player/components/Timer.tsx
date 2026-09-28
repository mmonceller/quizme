import type { TimerSettings } from '@shared/types';
import { cn } from '@/lib/utils';

const SIZE = { sm: 64, md: 88, lg: 120 };
const POSITION = {
  'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
  'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
  'top-left': 'top-20 left-4 sm:left-6',
  'top-right': 'top-20 right-4 sm:right-6',
};

function format(seconds: number) {
  const s = Math.ceil(seconds);
  if (s < 60) return String(s);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

interface TimerProps {
  total: number;
  remaining: number;
  settings: Pick<TimerSettings, 'style' | 'size' | 'position' | 'color'>;
  accent: string;
  paused?: boolean;
  /** Render inline (for settings previews) instead of fixed to a screen corner. */
  inline?: boolean;
}

export function Timer({ total, remaining, settings, accent, paused, inline }: TimerProps) {
  const size = SIZE[settings.size];
  const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const urgent = remaining <= Math.min(5, total * 0.25) && remaining > 0;
  const color = remaining <= 0 ? '#ef4444' : urgent ? '#ef4444' : (settings.color ?? accent);
  const label = remaining <= 0 ? '0' : format(remaining);

  let body: React.ReactNode;
  switch (settings.style) {
    case 'ring': {
      const r = 44;
      const c = 2 * Math.PI * r;
      body = (
        <div className="relative" style={{ width: size, height: size }}>
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-lg">
            <circle cx="50" cy="50" r="48" fill="rgba(255,255,255,0.95)" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - fraction)}
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center font-display font-extrabold tabular-nums"
            style={{ color, fontSize: size * 0.32 }}
          >
            {label}
          </span>
        </div>
      );
      break;
    }
    case 'bar':
      body = (
        <div
          className="flex items-center gap-2 rounded-full bg-white/95 p-1.5 pr-3 shadow-lg"
          style={{ width: size * 2.6, height: size * 0.5 }}
        >
          <div className="relative h-full flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${fraction * 100}%`, background: color }} />
          </div>
          <span className="font-display font-extrabold tabular-nums" style={{ color, fontSize: size * 0.24 }}>
            {label}s
          </span>
        </div>
      );
      break;
    case 'digital': {
      const s = Math.max(0, Math.ceil(remaining));
      body = (
        <div
          className="rounded-2xl px-4 py-2 font-mono font-bold tabular-nums shadow-lg"
          style={{ background: '#0f172a', color, fontSize: size * 0.36, boxShadow: `0 0 24px ${color}55` }}
        >
          {String(Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}
        </div>
      );
      break;
    }
    case 'bubble':
      body = (
        <div
          className="relative overflow-hidden rounded-full border-4 bg-white/95 shadow-lg"
          style={{ width: size, height: size, borderColor: color }}
        >
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ height: `${fraction * 100}%`, background: `${color}55`, transition: 'height 0.1s linear' }}
          />
          <span
            className="absolute inset-0 flex items-center justify-center font-display font-extrabold tabular-nums"
            style={{ color, fontSize: size * 0.34 }}
          >
            {label}
          </span>
        </div>
      );
      break;
  }

  return (
    <div
      className={cn(
        inline ? 'relative' : 'pointer-events-none fixed z-30',
        !inline && POSITION[settings.position],
        urgent && !paused && 'animate-urgent',
      )}
      aria-live="polite"
      aria-label={`${Math.ceil(remaining)} seconds left`}
    >
      {body}
      {paused && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
          PAUSED
        </span>
      )}
    </div>
  );
}
