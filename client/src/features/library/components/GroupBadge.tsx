import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Tinted square holding a group's icon, colored with the group's accent. */
export function GroupBadge({ color, size = 'md', children }: { color: string; size?: 'sm' | 'md' | 'lg'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg',
        size === 'sm' && 'h-7 w-7',
        size === 'md' && 'h-10 w-10',
        size === 'lg' && 'h-14 w-14 rounded-xl',
      )}
      style={{ background: `${color}14`, color, boxShadow: `inset 0 0 0 1px ${color}29` }}
    >
      {children}
    </span>
  );
}
