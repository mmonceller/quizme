import type { Accessory, Head } from './types';

/** Items held or worn in front of the figure. */
export function AccessoryArt({ item, head: { cx, cy, r } }: { item: Accessory; head: Head }) {
  switch (item) {
    case 'staff':
      return <path d="M51 66 V21 Q51 13 44.5 14.5" stroke="#78350f" strokeWidth={3} fill="none" strokeLinecap="round" />;
    case 'cane':
      return <path d="M50 66 V44 Q50 39 45.5 39.5" stroke="#57534e" strokeWidth={2.6} fill="none" strokeLinecap="round" />;
    case 'tablets':
      return (
        <g stroke="#57534e" strokeWidth={1}>
          <path d="M33 66 V51 Q33 47 37.5 47 Q42 47 42 51 V66 Z" fill="#d6d3d1" />
          <path d="M42 66 V51 Q42 47 46.5 47 Q51 47 51 51 V66 Z" fill="#e7e5e4" />
          <path d="M35.5 53 h4 M35.5 56 h4 M35.5 59 h4 M44.5 53 h4 M44.5 56 h4 M44.5 59 h4" strokeWidth={0.9} />
        </g>
      );
    case 'sling':
      return (
        <g>
          <path d="M37 66 Q41 52 46 49" stroke="#92400e" strokeWidth={1.6} fill="none" />
          <path d="M46 49 Q49 56 44 62" stroke="#92400e" strokeWidth={1.6} fill="none" />
          <circle cx={46.5} cy={49.5} r={2.6} fill="#9ca3af" stroke="#6b7280" strokeWidth={0.8} />
        </g>
      );
    case 'pacifier':
      return (
        <g transform={`translate(${cx} ${cy + r * 0.55})`}>
          <ellipse rx={4.2} ry={2.6} fill="#38bdf8" />
          <circle r={1.6} fill="#e0f2fe" />
          <circle cy={2.8} r={1.6} fill="none" stroke="#38bdf8" strokeWidth={1} />
        </g>
      );
    case 'glasses':
      return (
        <g stroke="#374151" strokeWidth={1.1} fill="rgba(255,255,255,0.25)">
          <circle cx={cx - r * 0.38} cy={cy + r * 0.08} r={r * 0.27} />
          <circle cx={cx + r * 0.38} cy={cy + r * 0.08} r={r * 0.27} />
          <path d={`M${cx - r * 0.11} ${cy + r * 0.05} h${r * 0.22}`} fill="none" />
        </g>
      );
    case 'dove':
      return (
        <g transform="translate(46 13)">
          <path d="M-6 2 Q-2 -4 3 -1 L7 -3 L5 1 Q4 6 -3 5 Z" fill="#fff" stroke="#94a3b8" strokeWidth={0.7} />
          <path d="M-2 1 Q1 -6 5 -6 Q3 -1 1 2 Z" fill="#f1f5f9" stroke="#94a3b8" strokeWidth={0.7} />
          <path d="M7 -3 l3 -0.5" stroke="#16a34a" strokeWidth={1.4} strokeLinecap="round" />
          <circle cx={4} cy={-1.5} r={0.6} fill="#1f2937" />
        </g>
      );
    case 'scroll':
      return (
        <g>
          <rect x={22} y={52} width={20} height={9} fill="#fde68a" stroke="#b45309" strokeWidth={0.8} />
          <rect x={20} y={51} width={3.5} height={11} rx={1.7} fill="#d97706" />
          <rect x={40.5} y={51} width={3.5} height={11} rx={1.7} fill="#d97706" />
          <path d="M26 55 h12 M26 58 h9" stroke="#b45309" strokeWidth={0.8} />
        </g>
      );
    case 'wheat':
      return (
        <g stroke="#a16207" strokeWidth={1.1} fill="#facc15">
          <path d="M49 66 Q49 50 51 38" fill="none" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <ellipse cx={48.4 + i * 0.4} cy={41 + i * 4} rx={1.6} ry={2.8} transform={`rotate(-30 ${48.4 + i * 0.4} ${41 + i * 4})`} />
              <ellipse cx={53 + i * 0.3} cy={41 + i * 4} rx={1.6} ry={2.8} transform={`rotate(30 ${53 + i * 0.3} ${41 + i * 4})`} />
            </g>
          ))}
          <ellipse cx={51} cy={36.5} rx={1.6} ry={2.8} />
        </g>
      );
    case 'fish':
      return (
        <g transform="translate(42 54) scale(0.85)">
          <path d="M-8 0 Q-2 -7 6 0 Q-2 7 -8 0 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth={0.8} />
          <path d="M6 0 L11 -4 V4 Z" fill="#60a5fa" stroke="#1d4ed8" strokeWidth={0.8} />
          <circle cx={-4} cy={-1} r={0.9} fill="#1e3a8a" />
        </g>
      );
    case 'key':
      return (
        <g stroke="#a16207" strokeWidth={1} fill="#facc15" transform="translate(-6 -2)">
          <circle cx={46} cy={50} r={3.6} />
          <circle cx={46} cy={50} r={1.3} fill="#fff7ed" />
          <path d="M48.6 52.6 L55 59 M52.5 57 l2-2 M54 58.5 l2-2" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'lion':
      return (
        <g transform="translate(44 53) scale(0.85)">
          <circle r={8} fill="#d97706" />
          <circle r={5.2} fill="#fbbf24" />
          <circle cx={-1.8} cy={-0.8} r={0.8} fill="#1f2937" />
          <circle cx={1.8} cy={-0.8} r={0.8} fill="#1f2937" />
          <path d="M-1.2 1.6 Q0 2.6 1.2 1.6" stroke="#78350f" strokeWidth={0.8} fill="none" />
        </g>
      );
    case 'lamb':
      return (
        <g transform="translate(44 55) scale(0.85)">
          {[-5, -1.5, 2, 5].map((x) => (
            <circle key={x} cx={x} cy={x % 2 ? -1 : 1} r={3.4} fill="#fff" stroke="#e2e8f0" strokeWidth={0.6} />
          ))}
          <ellipse cx={-7} cy={-2} rx={2.6} ry={2.2} fill="#44403c" />
          <circle cx={-7.6} cy={-2.4} r={0.5} fill="#fff" />
        </g>
      );
    case 'backpack':
      return (
        <g>
          <path d="M18 50 Q20 46 24 46 V60 H18 Z" fill="#f97316" />
          <path d="M24 46 Q27 50 26 58" stroke="#c2410c" strokeWidth={1.6} fill="none" />
        </g>
      );
  }
}
