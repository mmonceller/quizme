export const GROUP_ICON_KEYS = [
  'book', 'pencil', 'cap', 'calculator', 'flask', 'atom', 'globe',
  'map', 'landmark', 'language', 'code', 'chart', 'palette', 'music',
  'film', 'ball', 'gamepad', 'leaf', 'paw', 'planet', 'rocket',
  'lightbulb', 'star', 'heart', 'trophy', 'apple', 'compass', 'folder',
] as const;

export type GroupIconKey = (typeof GROUP_ICON_KEYS)[number];

export const DEFAULT_GROUP_ICON: GroupIconKey = 'book';

/** Group icons were stored as emoji before the icon set existed. */
export const LEGACY_EMOJI_ICONS: Record<string, GroupIconKey> = {
  '📚': 'book', '📖': 'book', '🔬': 'flask', '🧪': 'flask', '🧮': 'calculator', '🌍': 'globe',
  '🗺️': 'map', '🎨': 'palette', '🎵': 'music', '⚽': 'ball', '🏀': 'ball', '💻': 'code',
  '🤖': 'code', '🧠': 'lightbulb', '✏️': 'pencil', '🎓': 'cap', '🦖': 'paw', '🐶': 'paw',
  '🐱': 'paw', '🦁': 'paw', '🌱': 'leaf', '🌈': 'star', '⭐': 'star', '🚀': 'rocket',
  '🪐': 'planet', '🍎': 'apple', '🍕': 'apple', '🎬': 'film', '🎮': 'gamepad', '🏛️': 'landmark',
  '💡': 'lightbulb', '❤️': 'heart',
};

export function isGroupIconKey(value: unknown): value is GroupIconKey {
  return typeof value === 'string' && (GROUP_ICON_KEYS as readonly string[]).includes(value);
}

export function resolveGroupIcon(value: string | null | undefined): GroupIconKey {
  if (isGroupIconKey(value)) return value;
  return (value && LEGACY_EMOJI_ICONS[value]) || 'folder';
}
