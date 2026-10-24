import { useId, type SVGProps } from 'react';
import type { MazeMarker } from '@shared/types';
import { mediaUrl } from '@/api/config';
import { markerPreset } from './catalog';

/** A round badge showing the marker picture, ringed in the start/finish color. Works standalone or nested in another SVG. */
export function MarkerArt({ marker, ring, ...rest }: { marker: MazeMarker; ring: string } & SVGProps<SVGSVGElement>) {
  const clip = `marker-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const preset = marker.type === 'preset' ? markerPreset(marker.id) : undefined;

  return (
    <svg viewBox="0 0 64 64" {...rest}>
      <defs>
        <clipPath id={clip}>
          <circle cx={32} cy={32} r={29} />
        </clipPath>
      </defs>
      {marker.type === 'dot' || (marker.type === 'preset' && !preset) ? (
        <circle cx={32} cy={32} r={22} fill={ring} />
      ) : (
        <>
          <circle cx={32} cy={32} r={29} fill="#fff" />
          <g clipPath={`url(#${clip})`}>
            {preset ? preset.art : marker.type === 'image' && <image href={mediaUrl(marker.url)} width={64} height={64} preserveAspectRatio="xMidYMid slice" />}
          </g>
          <circle cx={32} cy={32} r={29.5} fill="none" stroke={ring} strokeWidth={5} />
        </>
      )}
    </svg>
  );
}
