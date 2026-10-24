import { capPath } from './hair';
import type { Head, Headwear } from './types';

/** Parts of the headwear that hang behind the head (veils and head cloths). */
export function HeadwearBack({ style, color, head: { cx, cy, r } }: { style: Headwear; color: string; head: Head }) {
  if (style !== 'veil' && style !== 'headcloth') return null;
  const drop = style === 'veil' ? r * 2.6 : r * 1.9;
  return (
    <path
      d={`M${cx - r - 5} ${cy + drop} L${cx - r - 3.5} ${cy - 1} C${cx - r - 3} ${cy - r - 6} ${cx + r + 3} ${cy - r - 6} ${cx + r + 3.5} ${cy - 1} L${cx + r + 5} ${cy + drop} Z`}
      fill={color}
    />
  );
}

export function HeadwearFront({ style, color, accent, head }: { style: Headwear; color: string; accent?: string; head: Head }) {
  const { cx, cy, r } = head;
  switch (style) {
    case 'veil':
      return <path d={capPath(head, 0.55)} fill={color} stroke={accent ?? 'rgba(255,255,255,0.55)'} strokeWidth={1} />;
    case 'headcloth':
      return (
        <>
          <path d={capPath(head, 0.35)} fill={color} />
          <path d={`M${cx - r - 1.5} ${cy - r * 0.35} Q${cx} ${cy - r * 0.75} ${cx + r + 1.5} ${cy - r * 0.35}`} stroke={accent ?? '#7c2d12'} strokeWidth={2.4} fill="none" />
        </>
      );
    case 'crown': {
      const base = cy - r * 0.62;
      const top = base - 8;
      return (
        <path
          d={`M${cx - 9} ${base} L${cx - 10} ${top + 1} L${cx - 5} ${top + 5} L${cx} ${top - 1} L${cx + 5} ${top + 5} L${cx + 10} ${top + 1} L${cx + 9} ${base} Z`}
          fill={color}
          stroke={accent ?? '#b45309'}
          strokeWidth={1}
          strokeLinejoin="round"
        />
      );
    }
    case 'cap':
      return (
        <>
          <path d={`M${cx - r - 0.5} ${cy - r * 0.2} C${cx - r} ${cy - r * 1.35} ${cx + r} ${cy - r * 1.35} ${cx + r + 0.5} ${cy - r * 0.2} Z`} fill={color} />
          <path d={`M${cx - 2} ${cy - r * 0.25} Q${cx + r + 4} ${cy - r * 0.45} ${cx + r + 9} ${cy - r * 0.05}`} stroke={accent ?? color} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      );
    case 'headband':
      return <path d={`M${cx - r - 0.5} ${cy - r * 0.38} Q${cx} ${cy - r * 0.8} ${cx + r + 0.5} ${cy - r * 0.38}`} stroke={color} strokeWidth={3} fill="none" />;
    case 'turban':
      return (
        <>
          <ellipse cx={cx} cy={cy - r * 0.62} rx={r + 2.5} ry={r * 0.62} fill={color} />
          <path d={`M${cx - r} ${cy - r * 0.45} Q${cx} ${cy - r * 1.3} ${cx + r * 0.9} ${cy - r * 0.85}`} stroke={accent ?? 'rgba(0,0,0,0.18)'} strokeWidth={1.4} fill="none" />
          <circle cx={cx} cy={cy - r * 0.7} r={1.8} fill={accent ?? '#facc15'} />
        </>
      );
  }
}
