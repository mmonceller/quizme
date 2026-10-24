import type { MazeOptions, WordSearchOptions } from '../types.ts';

export const DEFAULT_WORD_SEARCH_OPTIONS: WordSearchOptions = {
  size: 12,
  directions: ['horizontal', 'vertical', 'diagonal'],
  reverse: false,
  difficulty: 'medium',
  showWordList: true,
};

export const DEFAULT_MAZE_OPTIONS: MazeOptions = {
  shape: 'square',
  size: 'md',
  start: 'top-left',
  end: 'bottom-right',
};
