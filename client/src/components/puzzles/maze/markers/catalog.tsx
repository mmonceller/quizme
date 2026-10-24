import type { ReactNode } from 'react';
import { Person } from './person/Person';
import type { PersonSpec } from './person/types';
import { Ark, BethlehemStar, Cross, FinishFlag, Home, Treasure } from './things';

export type MarkerGroup = 'people' | 'bible' | 'things';

export interface MarkerPreset {
  id: string;
  label: string;
  group: MarkerGroup;
  art: ReactNode;
}

export const MARKER_GROUPS: { group: MarkerGroup; label: string }[] = [
  { group: 'people', label: 'People' },
  { group: 'bible', label: 'Bible characters' },
  { group: 'things', label: 'Places & things' },
];

const SKIN = { light: '#f9d7b5', medium: '#e3a878', tan: '#c68642', brown: '#8d5524', deep: '#5c3a21' };

const PEOPLE: Record<string, [string, PersonSpec]> = {
  baby: ['Baby', { background: '#fce7f3', skin: SKIN.light, headScale: 1.25, hair: { style: 'tuft', color: '#a16207' }, outfit: { style: 'onesie', color: '#7dd3fc' }, accessories: ['pacifier'], cheeks: true }],
  'child-boy': ['Boy', { background: '#dbeafe', skin: SKIN.tan, headScale: 1.15, hair: { style: 'curly', color: '#1f2937' }, outfit: { style: 'shirt', color: '#f97316' }, cheeks: true }],
  'child-girl': ['Girl', { background: '#fef3c7', skin: SKIN.medium, headScale: 1.12, hair: { style: 'pigtails', color: '#78350f' }, outfit: { style: 'dress', color: '#ec4899' }, cheeks: true }],
  'teen-boy': ['Teen boy', { background: '#e0e7ff', skin: SKIN.brown, headScale: 1.04, hair: { style: 'spiky', color: '#111827' }, outfit: { style: 'hoodie', color: '#4f46e5' }, accessories: ['backpack'] }],
  'teen-girl': ['Teen girl', { background: '#ccfbf1', skin: SKIN.light, headScale: 1.04, hair: { style: 'ponytail', color: '#b45309' }, outfit: { style: 'hoodie', color: '#0d9488' } }],
  man: ['Man', { background: '#dcfce7', skin: SKIN.medium, hair: { style: 'short', color: '#292524' }, beard: { style: 'short', color: '#292524' }, outfit: { style: 'shirt', color: '#2563eb' } }],
  woman: ['Woman', { background: '#fae8ff', skin: SKIN.deep, hair: { style: 'long', color: '#1c1917' }, outfit: { style: 'dress', color: '#a855f7' } }],
  grandpa: ['Grandpa', { background: '#f1f5f9', skin: SKIN.light, hair: { style: 'bald', color: '#e5e7eb' }, brows: '#d1d5db', outfit: { style: 'shirt', color: '#64748b' }, accessories: ['glasses', 'cane'] }],
  grandma: ['Grandma', { background: '#ffedd5', skin: SKIN.tan, hair: { style: 'bun', color: '#e5e7eb' }, brows: '#d1d5db', outfit: { style: 'dress', color: '#f43f5e' }, accessories: ['glasses'] }],
};

const BIBLE: Record<string, [string, PersonSpec]> = {
  noah: ['Noah', { background: '#bae6fd', skin: SKIN.medium, hair: { style: 'bald', color: '#f3f4f6' }, brows: '#f3f4f6', beard: { style: 'long', color: '#f3f4f6' }, outfit: { style: 'robe', color: '#92400e', trim: '#fcd34d' }, accessories: ['dove'] }],
  abraham: ['Abraham', { background: '#fef3c7', skin: SKIN.tan, headwear: { style: 'headcloth', color: '#f5f5f4', accent: '#78350f' }, brows: '#d1d5db', beard: { style: 'long', color: '#9ca3af' }, outfit: { style: 'robe', color: '#b45309' }, accessories: ['staff'] }],
  moses: ['Moses', { background: '#fde68a', skin: SKIN.medium, hair: { style: 'short', color: '#e5e7eb' }, brows: '#f3f4f6', beard: { style: 'long', color: '#f3f4f6' }, outfit: { style: 'robe', color: '#dc2626', trim: '#fde68a' }, accessories: ['tablets'] }],
  ruth: ['Ruth', { background: '#fef9c3', skin: SKIN.tan, headwear: { style: 'veil', color: '#fb923c' }, outfit: { style: 'robe', color: '#c2410c', trim: '#fed7aa' }, accessories: ['wheat'] }],
  david: ['David', { background: '#dbeafe', skin: SKIN.light, headScale: 1.06, hair: { style: 'curly', color: '#b45309' }, outfit: { style: 'robe', color: '#16a34a', trim: '#bbf7d0' }, accessories: ['sling'], cheeks: true }],
  esther: ['Esther', { background: '#f3e8ff', skin: SKIN.medium, hair: { style: 'long', color: '#1c1917' }, headwear: { style: 'crown', color: '#facc15' }, outfit: { style: 'robe', color: '#7e22ce', trim: '#facc15' } }],
  daniel: ['Daniel', { background: '#ffedd5', skin: SKIN.brown, headwear: { style: 'turban', color: '#f8fafc', accent: '#2563eb' }, beard: { style: 'short', color: '#1c1917' }, outfit: { style: 'robe', color: '#2563eb', trim: '#bfdbfe' }, accessories: ['lion'] }],
  jonah: ['Jonah', { background: '#cffafe', skin: SKIN.tan, hair: { style: 'short', color: '#44403c' }, beard: { style: 'full', color: '#44403c' }, outfit: { style: 'robe', color: '#0d9488' }, accessories: ['fish'] }],
  mary: ['Mary', { background: '#e0f2fe', skin: SKIN.medium, headwear: { style: 'veil', color: '#2563eb', accent: '#fff' }, outfit: { style: 'robe', color: '#f8fafc', trim: '#93c5fd' } }],
  joseph: ['Joseph', { background: '#fef3c7', skin: SKIN.tan, headwear: { style: 'headcloth', color: '#fde68a', accent: '#92400e' }, beard: { style: 'short', color: '#57534e' }, outfit: { style: 'robe', color: '#78350f', trim: '#fde68a' }, accessories: ['staff'] }],
  shepherd: ['Shepherd', { background: '#dcfce7', skin: SKIN.deep, headwear: { style: 'headcloth', color: '#e7e5e4', accent: '#16a34a' }, outfit: { style: 'robe', color: '#a16207' }, accessories: ['staff', 'lamb'] }],
  peter: ['Peter', { background: '#e0f2fe', skin: SKIN.medium, hair: { style: 'short', color: '#9ca3af' }, beard: { style: 'full', color: '#9ca3af' }, outfit: { style: 'robe', color: '#1d4ed8', trim: '#bfdbfe' }, accessories: ['key'] }],
  paul: ['Paul', { background: '#f5f5f4', skin: SKIN.tan, hair: { style: 'bald', color: '#44403c' }, beard: { style: 'full', color: '#44403c' }, outfit: { style: 'robe', color: '#b91c1c', trim: '#fecaca' }, accessories: ['scroll'] }],
};

const people = (group: MarkerGroup, entries: Record<string, [string, PersonSpec]>): MarkerPreset[] =>
  Object.entries(entries).map(([id, [label, spec]]) => ({ id, label, group, art: <Person spec={spec} /> }));

export const MARKER_PRESETS: MarkerPreset[] = [
  ...people('people', PEOPLE),
  ...people('bible', BIBLE),
  { id: 'ark', label: "Noah's ark", group: 'things', art: <Ark /> },
  { id: 'star', label: 'Star of Bethlehem', group: 'things', art: <BethlehemStar /> },
  { id: 'cross', label: 'Cross', group: 'things', art: <Cross /> },
  { id: 'home', label: 'Home', group: 'things', art: <Home /> },
  { id: 'treasure', label: 'Treasure', group: 'things', art: <Treasure /> },
  { id: 'flag', label: 'Finish flag', group: 'things', art: <FinishFlag /> },
];

export const markerPreset = (id: string) => MARKER_PRESETS.find((p) => p.id === id);
