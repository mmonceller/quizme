import type { CSSProperties, ReactNode } from 'react';
import type { CardStyle, Theme } from '@shared/types';
import { fontStack } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { themeBackgroundStyle } from './themeStyles';

/** Full-bleed themed background that hosts the player UI. */
export function ThemedStage({ theme, children, className }: { theme: Theme; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('relative min-h-screen w-full', className)}
      style={{ ...themeBackgroundStyle(theme), color: theme.textColor, fontFamily: fontStack(theme.fontFamily) }}
    >
      {children}
    </div>
  );
}

/** Themed rounded panel for showing quiz content inside regular app pages. */
export function ThemedBackdrop({ theme, children, className }: { theme: Theme; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-xl p-3 sm:p-5', className)}
      style={{ ...themeBackgroundStyle(theme), color: theme.textColor, fontFamily: fontStack(theme.fontFamily) }}
    >
      {children}
    </div>
  );
}

export function ThemedCard({
  theme,
  children,
  className,
  variant = 'card',
  style,
}: {
  theme: Theme;
  children: ReactNode;
  className?: string;
  variant?: CardStyle;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn('rounded-3xl', variant === 'card' && 'shadow-2xl backdrop-blur-md', variant === 'borderless' && 'backdrop-blur-md', className)}
      style={{
        background: variant === 'none' ? 'transparent' : theme.cardBg,
        color: theme.textColor,
        border: variant === 'card' ? `1px solid ${theme.accent}22` : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
