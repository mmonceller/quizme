import type { Theme } from '@shared/types';
import { cn } from '@/lib/utils';
import { themeBackgroundStyle } from '@/features/player/theme/themeStyles';

/** Small visual preview of a quiz theme. */
export function ThemeThumb({ theme, className, label }: { theme: Theme; className?: string; label?: string }) {
  return (
    <div className={cn('relative overflow-hidden', className)} style={themeBackgroundStyle(theme)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-3">
        <div className="h-2 w-2/3 rounded-full opacity-90" style={{ background: theme.textColor }} />
        <div className="grid w-4/5 grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3 rounded"
              style={{ background: i === 0 ? theme.accent : theme.choiceBg, border: `1px solid ${theme.accent}33` }}
            />
          ))}
        </div>
      </div>
      {label && (
        <span className="absolute bottom-1 left-1.5 rounded bg-black/40 px-1.5 text-[10px] font-semibold text-white">
          {label}
        </span>
      )}
    </div>
  );
}
