import type { Outfit } from './types';

const SHOULDERS = 'M7 66 C7 51 17 44.5 32 44.5 C47 44.5 57 51 57 66 Z';

export function Body({ style, color, trim, skin }: { style: Outfit; color: string; trim?: string; skin: string }) {
  return (
    <g>
      <rect x={28} y={35} width={8} height={11} rx={3} fill={skin} />
      <rect x={28} y={35} width={8} height={11} rx={3} fill="#000" opacity={0.08} />
      <path d={SHOULDERS} fill={color} />
      {style === 'robe' && (
        <>
          <path d="M25.5 45.5 L32 55 L38.5 45.5" stroke={trim ?? 'rgba(255,255,255,0.6)'} strokeWidth={2} fill="none" strokeLinejoin="round" />
          <path d="M14 66 Q16 54 22 49" stroke="rgba(0,0,0,0.15)" strokeWidth={1.5} fill="none" />
          <path d="M50 66 Q48 54 42 49" stroke="rgba(0,0,0,0.15)" strokeWidth={1.5} fill="none" />
        </>
      )}
      {style === 'shirt' && <path d="M27 45 L32 50 L37 45" stroke={trim ?? 'rgba(255,255,255,0.7)'} strokeWidth={1.8} fill="none" strokeLinejoin="round" />}
      {style === 'dress' && <path d="M25 45.5 Q32 52 39 45.5" stroke={trim ?? 'rgba(255,255,255,0.7)'} strokeWidth={2} fill="none" />}
      {style === 'hoodie' && (
        <>
          <path d="M22 46.5 Q32 53 42 46.5" stroke="rgba(0,0,0,0.18)" strokeWidth={3} fill="none" />
          <path d="M29 50 v6 M35 50 v6" stroke={trim ?? '#fff'} strokeWidth={1.3} strokeLinecap="round" />
        </>
      )}
      {style === 'onesie' && (
        <>
          <path d="M26 45.5 Q32 50 38 45.5" stroke={trim ?? '#fff'} strokeWidth={2} fill="none" />
          <circle cx={32} cy={55} r={1.2} fill={trim ?? '#fff'} />
          <circle cx={32} cy={60} r={1.2} fill={trim ?? '#fff'} />
        </>
      )}
    </g>
  );
}
