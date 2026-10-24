import type { HairStyle, Head } from './types';

/** Hair drawn behind the head and body outline (long hair, ponytails). */
export function HairBack({ style, color, head: { cx, cy, r } }: { style: HairStyle; color: string; head: Head }) {
  if (style === 'long')
    return <path d={`M${cx - r - 2} ${cy} Q${cx - r - 3} ${cy + r * 1.9} ${cx - r + 2} ${cy + r * 2.1} H${cx + r - 2} Q${cx + r + 3} ${cy + r * 1.9} ${cx + r + 2} ${cy} Z`} fill={color} />;
  if (style === 'ponytail') return <ellipse cx={cx + r + 2} cy={cy + 2} rx={4} ry={9} fill={color} transform={`rotate(-18 ${cx + r + 2} ${cy + 2})`} />;
  if (style === 'pigtails')
    return (
      <>
        <circle cx={cx - r - 2} cy={cy + 3} r={4.5} fill={color} />
        <circle cx={cx + r + 2} cy={cy + 3} r={4.5} fill={color} />
      </>
    );
  return null;
}

/** Cap of hair over the top of the head with a side-swept fringe. */
export function capPath({ cx, cy, r }: Head, depth = 0.15): string {
  return `M${cx - r - 0.5} ${cy + r * depth} C${cx - r - 1} ${cy - r * 1.35} ${cx + r + 1} ${cy - r * 1.35} ${cx + r + 0.5} ${cy + r * depth} C${cx + r * 0.6} ${cy - r * 0.55} ${cx - r * 0.2} ${cy - r * 0.35} ${cx - r - 0.5} ${cy + r * depth} Z`;
}

export function HairFront({ style, color, head }: { style: HairStyle; color: string; head: Head }) {
  const { cx, cy, r } = head;
  switch (style) {
    case 'bald':
      return (
        <>
          <path d={`M${cx - r - 0.5} ${cy + 3} Q${cx - r - 1} ${cy - 4} ${cx - r + 4} ${cy - 6}`} stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d={`M${cx + r + 0.5} ${cy + 3} Q${cx + r + 1} ${cy - 4} ${cx + r - 4} ${cy - 6}`} stroke={color} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </>
      );
    case 'tuft':
      return <path d={`M${cx - 1} ${cy - r + 0.5} Q${cx + 1} ${cy - r - 5} ${cx + 5} ${cy - r - 2.5}`} stroke={color} strokeWidth={2.2} fill="none" strokeLinecap="round" />;
    case 'curly':
      return (
        <>
          <path d={capPath(head, 0)} fill={color} />
          {[-0.85, -0.45, 0, 0.45, 0.85].map((t) => (
            <circle key={t} cx={cx + t * r} cy={cy - r * Math.cos(Math.asin(Math.min(0.95, Math.abs(t)))) + 1} r={3.4} fill={color} />
          ))}
        </>
      );
    case 'spiky':
      return (
        <path
          d={`M${cx - r - 0.5} ${cy + 1} L${cx - r + 1} ${cy - r * 0.9} L${cx - r * 0.5} ${cy - r * 0.95} L${cx - r * 0.35} ${cy - r - 4} L${cx} ${cy - r - 0.5} L${cx + r * 0.3} ${cy - r - 5} L${cx + r * 0.55} ${cy - r * 0.9} L${cx + r + 1} ${cy - r - 2} L${cx + r + 0.5} ${cy + 1} C${cx + r * 0.5} ${cy - r * 0.5} ${cx - r * 0.4} ${cy - r * 0.45} ${cx - r - 0.5} ${cy + 1} Z`}
          fill={color}
        />
      );
    case 'bun':
      return (
        <>
          <circle cx={cx} cy={cy - r - 2.5} r={5} fill={color} />
          <path d={capPath(head)} fill={color} />
        </>
      );
    default:
      return <path d={capPath(head, style === 'long' || style === 'pigtails' ? 0.45 : 0.15)} fill={color} />;
  }
}
