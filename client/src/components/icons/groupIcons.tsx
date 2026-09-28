import type { ReactNode } from 'react';
import { resolveGroupIcon, type GroupIconKey } from '@shared/groupIcons';
import { createIcon, type IconComponent, type IconProps } from './Icon';

const dot = (cx: number, cy: number, r = 0.9) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;

const BODIES: Record<GroupIconKey, ReactNode> = {
  book: (
    <>
      <path d="M12 6.5C10.4 5.3 8.2 4.5 4 4.5v13c4.2 0 6.4.8 8 2 1.6-1.2 3.8-2 8-2v-13c-4.2 0-6.4.8-8 2Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  pencil: (
    <>
      <path d="M15.5 4.5 19.5 8.5 8.5 19.5H4.5v-4L15.5 4.5Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  cap: (
    <>
      <path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z" />
      <path d="M6.5 11v4.5c1.5 1.3 3.5 2 5.5 2s4-.7 5.5-2V11" />
      <path d="M21.5 9v5" />
    </>
  ),
  calculator: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <rect x="8" y="6" width="8" height="3.5" rx="0.5" />
      {dot(8.8, 13)}
      {dot(12, 13)}
      {dot(15.2, 13)}
      {dot(8.8, 16.5)}
      {dot(12, 16.5)}
      {dot(15.2, 16.5)}
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3.5h5" />
      <path d="M10.5 3.5v5.2L5.2 17.6a2 2 0 0 0 1.7 2.9h10.2a2 2 0 0 0 1.7-2.9L13.5 8.7V3.5" />
      <path d="M7.4 14h9.2" />
    </>
  ),
  atom: (
    <>
      <ellipse cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
      {dot(12, 12, 1.2)}
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="3.8" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  map: (
    <>
      <path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2v-13Z" />
      <path d="M9 4.5v13" />
      <path d="M15 6.5v13" />
    </>
  ),
  landmark: (
    <>
      <path d="M3.5 9 12 4l8.5 5h-17Z" />
      <path d="M5.5 9v8M9.8 9v8M14.2 9v8M18.5 9v8" />
      <path d="M4 17.5h16M3 20.5h18" />
    </>
  ),
  language: (
    <>
      <path d="M4.5 5h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4.5 3.5V16h-1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  code: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="m9.5 10-2 2 2 2M14.5 10l2 2-2 2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 16.5V11M12 16.5V6.5M17 16.5V13" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.7 1.7-1.7h2a4 4 0 0 0 4-4c0-4-3.8-7.2-8.5-7.2Z" />
      {dot(7.5, 11.5, 1)}
      {dot(10, 7.5, 1)}
      {dot(14.5, 7.5, 1)}
    </>
  ),
  music: (
    <>
      <path d="M9 17.5v-12l10-2v12" />
      <circle cx="6.8" cy="17.5" r="2.2" />
      <circle cx="16.8" cy="15.5" r="2.2" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7.5 4v16M16.5 4v16M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" />
      <path d="M6 4.9c2 2 3 4.5 3 7.1s-1 5.1-3 7.1M18 4.9c-2 2-3 4.5-3 7.1s1 5.1 3 7.1" />
    </>
  ),
  gamepad: (
    <>
      <path d="M7 8h10a4 4 0 0 1 4 4v2.5a3 3 0 0 1-5.4 1.8L14.5 15h-5l-1.1 1.3A3 3 0 0 1 3 14.5V12a4 4 0 0 1 4-4Z" />
      <path d="M7.5 10.5v3M6 12h3" />
      {dot(15.5, 11)}
      {dot(17.3, 13)}
    </>
  ),
  leaf: (
    <>
      <path d="M5.5 18.5C5.5 10 10 5 19.5 4.5 19 14 14 18.5 5.5 18.5Z" />
      <path d="M5.5 18.5 13 11" />
    </>
  ),
  paw: (
    <>
      <circle cx="8.3" cy="7.8" r="1.7" />
      <circle cx="15.7" cy="7.8" r="1.7" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <path d="M12 11.5c-2.8 0-5 3-5 5.3 0 1.6 1.3 2.2 2.6 2.2 1 0 1.5-.5 2.4-.5s1.4.5 2.4.5c1.3 0 2.6-.6 2.6-2.2 0-2.3-2.2-5.3-5-5.3Z" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M6.2 14.2c-2.3 1.6-3.4 3-2.9 3.8.9 1.5 5.8-.1 10.8-3.6s8.4-7.6 7.5-9.1c-.5-.8-2.2-.7-4.5.2" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c3 1.8 4.5 5 4.5 8.5V16h-9v-4.5C7.5 8 9 4.8 12 3Z" />
      <circle cx="12" cy="10" r="1.5" />
      <path d="M7.5 13 5 15.5V19l2.5-1.5M16.5 13l2.5 2.5V19l-2.5-1.5M10.5 19.5h3" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.3v.9h6v-.9c0-.5.2-1 .6-1.3A6 6 0 0 0 12 3Z" />
      <path d="M9.5 18.5h5M10.5 21h3" />
    </>
  ),
  star: <path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8L12 3.8Z" />,
  heart: <path d="M12 19.5s-7.5-4.4-7.5-10A4.1 4.1 0 0 1 12 7.2a4.1 4.1 0 0 1 7.5 2.3c0 5.6-7.5 10-7.5 10Z" />,
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.5H5.5v1A3 3 0 0 0 8 9.5M16 5.5h2.5v1A3 3 0 0 1 16 9.5" />
      <path d="M12 13v3.5M8.5 20h7l-.6-3.5H9.1L8.5 20Z" />
    </>
  ),
  apple: (
    <>
      <path d="M12 7.5c-1.3-1-3-1.4-4.5-.9C5 7.4 4 10 4.5 13c.6 3.9 3.2 7.5 5.5 7.5 1 0 1.4-.5 2-.5s1 .5 2 .5c2.3 0 4.9-3.6 5.5-7.5.5-3-.5-5.6-3-6.4-1.5-.5-3.2-.1-4.5.9Z" />
      <path d="M12 7.5c0-2 1-3.5 3-4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  folder: <path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5V7Z" />,
};

const ICONS = Object.fromEntries(
  Object.entries(BODIES).map(([key, body]) => [key, createIcon(`GroupIcon.${key}`, body)]),
) as Record<GroupIconKey, IconComponent>;

export const GROUP_ICON_LABELS: Record<GroupIconKey, string> = {
  book: 'Book', pencil: 'Pencil', cap: 'Graduation', calculator: 'Math', flask: 'Science', atom: 'Physics',
  globe: 'Geography', map: 'Map', landmark: 'History', language: 'Language', code: 'Computers', chart: 'Statistics',
  palette: 'Art', music: 'Music', film: 'Film', ball: 'Sports', gamepad: 'Games', leaf: 'Nature', paw: 'Animals',
  planet: 'Space', rocket: 'Rocket', lightbulb: 'Ideas', star: 'Star', heart: 'Heart', trophy: 'Trophy',
  apple: 'Food', compass: 'Explore', folder: 'General',
};

/** Renders a group's icon; accepts legacy emoji values too. */
export function GroupIcon({ icon, ...props }: IconProps & { icon: string | null | undefined }) {
  const Icon = ICONS[resolveGroupIcon(icon)];
  return <Icon {...props} />;
}
