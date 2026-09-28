import { useEffect, useRef, useState, type ReactNode } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  hidden?: boolean;
}

export function Menu({
  items,
  trigger,
  align = 'right',
  className,
}: {
  items: MenuItem[];
  trigger?: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="More actions"
      >
        {trigger ?? <MoreVertical className="h-5 w-5" />}
      </button>
      {open && (
        <div
          className={cn(
            'absolute z-30 mt-1 min-w-[196px] animate-pop overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/8',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items
            .filter((i) => !i.hidden)
            .map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  item.onClick();
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm',
                  item.danger ? 'text-rose-700 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-100',
                )}
              >
                <span className="h-4 w-4 shrink-0 opacity-80 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>
                {item.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
