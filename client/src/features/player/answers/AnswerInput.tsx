import type { CSSProperties } from 'react';
import type { Theme } from '@shared/types';
import { cn } from '@/lib/utils';
import { CORRECT, WRONG } from './types';

/** Themed text input with correct/incorrect feedback. */
export function AnswerInput({
  value,
  onChange,
  theme,
  disabled,
  status,
  placeholder,
  css,
  className,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  theme: Theme;
  disabled?: boolean;
  status?: 'correct' | 'wrong' | null;
  placeholder?: string;
  css?: CSSProperties;
  className?: string;
  autoFocus?: boolean;
}) {
  const border = status === 'correct' ? CORRECT : status === 'wrong' ? WRONG : `${theme.accent}66`;
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      className={cn('rounded-2xl border-[3px] px-4 py-3 outline-none transition focus:shadow-lg disabled:opacity-100', className)}
      style={{ borderColor: border, background: theme.choiceBg, color: theme.choiceText, ...css, textAlign: 'left' }}
    />
  );
}
