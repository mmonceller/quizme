import type { CSSProperties } from 'react';
import type { TextStyle, Theme } from '@shared/types';
import { fontStack } from '@/lib/fonts';
import { mediaUrl } from '@/api/config';

export function themeBackgroundStyle(theme: Theme): CSSProperties {
  if (theme.backgroundImage) {
    const o = theme.overlay;
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,${o}), rgba(0,0,0,${o})), url("${mediaUrl(theme.backgroundImage)}")`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: theme.background };
}

/** Container width (px) at which text renders at exactly its configured font size. */
const REFERENCE_WIDTH = 640;

/**
 * Converts a text style to CSS. Font size follows the width of the nearest CSS container,
 * so text shrinks to fit phones and grows on wide presentation screens.
 */
export function textStyleCss(style: TextStyle, theme: Theme, fallbackColor: string, maxScale = 3): CSSProperties {
  const min = Math.min(style.fontSize, Math.max(15, Math.round(style.fontSize * 0.72)));
  const fluid = ((style.fontSize / REFERENCE_WIDTH) * 100).toFixed(3);
  return {
    fontFamily: fontStack(style.fontFamily === 'inherit' ? theme.fontFamily : style.fontFamily),
    fontSize: `clamp(${min}px, ${fluid}cqi, ${Math.round(style.fontSize * maxScale)}px)`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    color: style.color ?? fallbackColor,
    textAlign: style.align,
    lineHeight: 1.3,
  };
}

export function mergeStyle(base: TextStyle, override?: Partial<TextStyle>): TextStyle {
  return override ? { ...base, ...override } : base;
}
