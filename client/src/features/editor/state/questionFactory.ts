import type { BaseQuestion, Question, QuestionType } from '@shared/types';
import { DEFAULT_MAZE_OPTIONS, DEFAULT_WORD_SEARCH_OPTIONS } from '@shared/puzzles/defaults';
import { generateMaze } from '@shared/puzzles/maze';
import { randomSeed } from '@shared/puzzles/random';
import { generateWordSearch } from '@shared/puzzles/wordSearch';
import { uid } from '@/lib/utils';

function base<T extends QuestionType>(type: T, prompt = ''): BaseQuestion & { type: T } {
  return { id: uid(), type, prompt, image: null, points: 1, timerSeconds: null, revealAnswer: 'inherit' };
}

export function createQuestion(type: QuestionType): Question {
  switch (type) {
    case 'multiple_choice':
      return {
        ...base(type),
        choices: Array.from({ length: 4 }, (_, i) => ({ id: uid(), text: '', image: null, correct: i === 0 })),
      };
    case 'true_false':
      return { ...base(type), answer: true };
    case 'identification':
      return { ...base(type), answers: [''], caseSensitive: false };
    case 'fill_blank':
      return { ...base(type, 'Fill in the blanks.'), text: '', caseSensitive: false };
    case 'matching':
      return { ...base(type, 'Match each item on the left with the correct answer.'), pairs: Array.from({ length: 3 }, () => ({ id: uid(), left: '', right: '' })) };
    case 'enumeration':
      return { ...base(type), answers: ['', '', ''], ordered: false, caseSensitive: false };
    case 'sequencing':
      return { ...base(type, 'Put these in the correct order.'), items: Array.from({ length: 4 }, () => ({ id: uid(), text: '' })) };
    case 'word_search': {
      const words = ['', '', '', ''];
      const options = { ...DEFAULT_WORD_SEARCH_OPTIONS, directions: [...DEFAULT_WORD_SEARCH_OPTIONS.directions] };
      const seed = randomSeed();
      const { grid, placements } = generateWordSearch(words, options, seed);
      return { ...base(type, 'Find all the hidden words.'), timerSeconds: 180, words, options, seed, grid, placements };
    }
    case 'maze': {
      const options = { ...DEFAULT_MAZE_OPTIONS };
      const seed = randomSeed();
      return { ...base(type, 'Find your way from start to finish.'), timerSeconds: 120, options, seed, ...generateMaze(options, seed) };
    }
  }
}

/** Deep copy with fresh ids so the duplicate is independent of the original. */
export function cloneQuestion(q: Question): Question {
  const copy = structuredClone(q);
  copy.id = uid();
  if (copy.type === 'multiple_choice') copy.choices = copy.choices.map((c) => ({ ...c, id: uid() }));
  if (copy.type === 'matching') copy.pairs = copy.pairs.map((p) => ({ ...p, id: uid() }));
  if (copy.type === 'sequencing') copy.items = copy.items.map((i) => ({ ...i, id: uid() }));
  return copy;
}
