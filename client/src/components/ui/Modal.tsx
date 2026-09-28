import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' };

/** Bottom sheet on mobile, centered dialog on larger screens. */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className={cn(
          'relative flex max-h-[92vh] w-full animate-slide-up flex-col rounded-t-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 sm:rounded-xl',
          SIZES[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start gap-4 border-b border-slate-200 px-6 pt-6 pb-5 sm:px-7">
            <div className="min-w-0 flex-1">
              {title && <h2 className="font-display text-[17px] font-semibold leading-snug text-slate-900">{title}</h2>}
              {description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="-mr-2 -mt-1 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-6 sm:px-7">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2.5 rounded-b-none border-t border-slate-200 bg-slate-50/60 px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-b-xl sm:px-7">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
