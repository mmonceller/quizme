import type { BeardStyle, Head } from './types';

export function Beard({ style, color, head: { cx, cy, r } }: { style: BeardStyle; color: string; head: Head }) {
  const chin = style === 'short' ? cy + r + 2 : style === 'full' ? cy + r + 6 : cy + r + 15;
  const tip = style === 'long' ? `Q${cx + 4} ${chin - 2} ${cx} ${chin} Q${cx - 4} ${chin - 2}` : `Q${cx + r * 0.6} ${chin} ${cx} ${chin} Q${cx - r * 0.6} ${chin}`;
  return (
    <>
      <path
        d={`M${cx - r + 0.5} ${cy - 1} Q${cx - r} ${cy + r * 0.9} ${cx - r * 0.5} ${chin - 3} ${tip} ${cx + r * 0.5} ${chin - 3} Q${cx + r} ${cy + r * 0.9} ${cx + r - 0.5} ${cy - 1} Q${cx + r * 0.55} ${cy + 3.5} ${cx} ${cy + 3.5} Q${cx - r * 0.55} ${cy + 3.5} ${cx - r + 0.5} ${cy - 1} Z`}
        fill={color}
      />
      <path d={`M${cx - 5} ${cy + 5.2} Q${cx} ${cy + 2.6} ${cx + 5} ${cy + 5.2}`} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </>
  );
}

export function Face({ head: { cx, cy, r }, brows, cheeks, smile = true }: { head: Head; brows?: string; cheeks?: boolean; smile?: boolean }) {
  const eyeY = cy + r * 0.08;
  const dx = r * 0.38;
  const eyeR = Math.max(1.3, r * 0.12);
  return (
    <g>
      <circle cx={cx - dx} cy={eyeY} r={eyeR} fill="#1f2937" />
      <circle cx={cx + dx} cy={eyeY} r={eyeR} fill="#1f2937" />
      <circle cx={cx - dx + 0.45} cy={eyeY - 0.45} r={eyeR * 0.35} fill="#fff" />
      <circle cx={cx + dx + 0.45} cy={eyeY - 0.45} r={eyeR * 0.35} fill="#fff" />
      {brows && (
        <>
          <path d={`M${cx - dx - 2.4} ${eyeY - 3.4} h4.6`} stroke={brows} strokeWidth={1.6} strokeLinecap="round" />
          <path d={`M${cx + dx - 2.2} ${eyeY - 3.4} h4.6`} stroke={brows} strokeWidth={1.6} strokeLinecap="round" />
        </>
      )}
      {cheeks && (
        <>
          <circle cx={cx - r * 0.62} cy={cy + r * 0.42} r={r * 0.16} fill="#f472b6" opacity={0.35} />
          <circle cx={cx + r * 0.62} cy={cy + r * 0.42} r={r * 0.16} fill="#f472b6" opacity={0.35} />
        </>
      )}
      {smile && (
        <path d={`M${cx - r * 0.28} ${cy + r * 0.45} Q${cx} ${cy + r * 0.7} ${cx + r * 0.28} ${cy + r * 0.45}`} stroke="#7c2d12" strokeWidth={1.3} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}
