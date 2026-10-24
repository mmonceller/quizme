import { AccessoryArt } from './accessories';
import { Beard, Face } from './face';
import { HairBack, HairFront } from './hair';
import { HeadwearBack, HeadwearFront } from './headwear';
import { Body } from './outfit';
import type { Head, PersonSpec } from './types';

/** A friendly head-and-shoulders portrait in a 64 × 64 box, layered back to front. */
export function Person({ spec }: { spec: PersonSpec }) {
  const scale = spec.headScale ?? 1;
  const head: Head = { cx: 32, cy: 27 + (scale - 1) * 8, r: 11 * scale };
  const accessories = spec.accessories ?? [];

  return (
    <g>
      <rect width={64} height={64} fill={spec.background} />
      {spec.headwear && <HeadwearBack style={spec.headwear.style} color={spec.headwear.color} head={head} />}
      <Body style={spec.outfit.style} color={spec.outfit.color} trim={spec.outfit.trim} skin={spec.skin} />
      {spec.hair && !spec.headwear?.style.match(/veil|headcloth/) && <HairBack style={spec.hair.style} color={spec.hair.color} head={head} />}
      <circle cx={head.cx - head.r} cy={head.cy + 1.5} r={2.4} fill={spec.skin} />
      <circle cx={head.cx + head.r} cy={head.cy + 1.5} r={2.4} fill={spec.skin} />
      <circle cx={head.cx} cy={head.cy} r={head.r} fill={spec.skin} />
      {spec.beard && <Beard style={spec.beard.style} color={spec.beard.color} head={head} />}
      <Face head={head} brows={spec.brows} cheeks={spec.cheeks} smile={!accessories.includes('pacifier')} />
      {spec.hair && !spec.headwear?.style.match(/veil|headcloth|turban/) && <HairFront style={spec.hair.style} color={spec.hair.color} head={head} />}
      {spec.headwear && <HeadwearFront style={spec.headwear.style} color={spec.headwear.color} accent={spec.headwear.accent} head={head} />}
      {accessories.map((a) => (
        <AccessoryArt key={a} item={a} head={head} />
      ))}
    </g>
  );
}
