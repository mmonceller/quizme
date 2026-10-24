/** Destination pictures in a 64 × 64 box. */

export function Ark() {
  return (
    <g>
      <rect width={64} height={64} fill="#bae6fd" />
      <circle cx={50} cy={14} r={6} fill="#fde047" />
      <rect x={20} y={22} width={24} height={13} fill="#a16207" />
      <path d="M17 23 L32 13 L47 23 Z" fill="#78350f" />
      <rect x={29} y={26} width={6} height={6} fill="#422006" />
      <path d="M6 35 H58 L50 48 H14 Z" fill="#92400e" />
      <path d="M10 39 H54" stroke="#78350f" strokeWidth={1.4} />
      <path d="M0 50 Q8 45 16 50 T32 50 T48 50 T64 50 V64 H0 Z" fill="#3b82f6" />
      <path d="M0 56 Q8 51 16 56 T32 56 T48 56 T64 56" stroke="#93c5fd" strokeWidth={1.5} fill="none" />
    </g>
  );
}

export function BethlehemStar() {
  return (
    <g>
      <rect width={64} height={64} fill="#1e1b4b" />
      <circle cx={32} cy={28} r={16} fill="#fde047" opacity={0.18} />
      <path d="M32 8 L36 24 L52 28 L36 32 L32 48 L28 32 L12 28 L28 24 Z" fill="#fde047" />
      <path d="M32 28 L32 60" stroke="#fde047" strokeWidth={1} opacity={0.5} />
      <circle cx={12} cy={12} r={1} fill="#fff" />
      <circle cx={52} cy={10} r={1.2} fill="#fff" />
      <circle cx={10} cy={48} r={0.9} fill="#fff" />
      <path d="M0 56 L14 50 L26 54 L40 48 L64 55 V64 H0 Z" fill="#312e81" />
    </g>
  );
}

export function Home() {
  return (
    <g>
      <rect width={64} height={64} fill="#dcfce7" />
      <rect x={0} y={50} width={64} height={14} fill="#86efac" />
      <rect x={16} y={30} width={32} height={22} fill="#fef3c7" />
      <path d="M11 32 L32 14 L53 32 Z" fill="#dc2626" />
      <rect x={28} y={38} width={8} height={14} rx={1} fill="#92400e" />
      <rect x={19} y={35} width={7} height={7} fill="#7dd3fc" stroke="#fff" strokeWidth={1} />
      <rect x={38} y={35} width={7} height={7} fill="#7dd3fc" stroke="#fff" strokeWidth={1} />
      <rect x={42} y={17} width={4} height={8} fill="#7f1d1d" />
    </g>
  );
}

export function FinishFlag() {
  const squares = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) if ((r + c) % 2 === 0) squares.push(<rect key={`${r}-${c}`} x={22 + c * 5} y={14 + r * 5} width={5} height={5} fill="#111827" />);
  return (
    <g>
      <rect width={64} height={64} fill="#fef9c3" />
      <path d="M20 12 V58" stroke="#475569" strokeWidth={2.5} strokeLinecap="round" />
      <rect x={22} y={14} width={25} height={20} fill="#fff" stroke="#111827" strokeWidth={0.6} />
      {squares}
      <ellipse cx={20} cy={58} rx={7} ry={2} fill="#000" opacity={0.15} />
    </g>
  );
}

export function Treasure() {
  return (
    <g>
      <rect width={64} height={64} fill="#fef3c7" />
      <path d="M14 32 Q14 20 32 20 Q50 20 50 32 Z" fill="#b45309" />
      <rect x={14} y={32} width={36} height={18} fill="#92400e" />
      <rect x={14} y={30} width={36} height={4} fill="#facc15" />
      <rect x={29} y={30} width={6} height={9} rx={1} fill="#facc15" />
      <circle cx={32} cy={35} r={1.2} fill="#78350f" />
      <circle cx={22} cy={18} r={2.5} fill="#fde047" />
      <circle cx={40} cy={16} r={2} fill="#fde047" />
      <path d="M46 12 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 Z" fill="#fff" />
    </g>
  );
}

export function Cross() {
  return (
    <g>
      <rect width={64} height={64} fill="#fde68a" />
      <circle cx={32} cy={30} r={20} fill="#fff7ed" opacity={0.7} />
      <rect x={28.5} y={12} width={7} height={40} rx={1.5} fill="#92400e" />
      <rect x={18} y={22} width={28} height={7} rx={1.5} fill="#92400e" />
      <path d="M0 54 Q32 46 64 54 V64 H0 Z" fill="#84cc16" />
    </g>
  );
}
