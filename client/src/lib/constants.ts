import type { Gender } from '@shared/types';

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export const GROUP_COLORS = [
  '#3a5196', '#5b4b9a', '#9b3f6b', '#b0413e', '#b8652a', '#a3821f', '#4d7c3a', '#2f7a6d', '#2d6f8f', '#475569', '#6b5e4f', '#1f2937',
];
