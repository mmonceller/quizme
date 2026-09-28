import { Link } from 'react-router';
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('h-8 w-8', className)}>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <circle cx="15" cy="15" r="6.5" stroke="#fff" strokeWidth="2.5" />
      <path d="M18.8 18.8 23 23" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="23" cy="9" r="2" fill="#8fa7e6" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <LogoMark className={light ? 'text-white/15' : 'text-brand-900'} />
      <span className={cn('font-display text-[17px] font-semibold', light ? 'text-white' : 'text-slate-900')}>QuizGame</span>
    </Link>
  );
}
