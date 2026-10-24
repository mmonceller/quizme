import { DEFAULT_MAZE_OPTIONS, DEFAULT_WORD_SEARCH_OPTIONS } from '../../../shared/puzzles/defaults.ts';
import { isActive, isCell, parseMaze } from '../../../shared/puzzles/maze/index.ts';
import { WORD_SEARCH_LIMITS, clampGridSize, wordPointList, wordSearchTotal } from '../../../shared/puzzles/wordSearch/index.ts';
import type {
  MazeAnchor,
  MazeMarker,
  MazeOptions,
  MazeQuestion,
  MazeShape,
  MazeSize,
  WordDirection,
  WordPlacement,
  WordSearchDifficulty,
  WordSearchOptions,
  WordSearchQuestion,
} from '../../../shared/types.ts';
import { badRequest } from '../utils/http.ts';

const DIRECTIONS: WordDirection[] = ['horizontal', 'vertical', 'diagonal'];
const DIFFICULTIES: WordSearchDifficulty[] = ['easy', 'medium', 'hard'];
const SHAPES: MazeShape[] = ['rectangle', 'square', 'circle', 'ring', 'diamond', 'triangle', 'hexagon', 'heart'];
const MAZE_SIZES: MazeSize[] = ['sm', 'md', 'lg', 'xl'];
const ANCHORS: MazeAnchor[] = [
  'top-left',
  'top',
  'top-right',
  'left',
  'center',
  'right',
  'bottom-left',
  'bottom',
  'bottom-right',
  'random',
  'custom',
];
const MAX_MAZE_CELLS = 40;

const oneOf = <T>(allowed: T[], value: unknown, fallback: T): T => (allowed.includes(value as T) ? (value as T) : fallback);
const asObject = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' ? (value as Record<string, unknown>) : {});
const seedOf = (value: unknown) => (Number.isInteger(value) ? (value as number) : 1);

export function cleanWordSearch(q: WordSearchQuestion, index: number): WordSearchQuestion {
  const raw = asObject(q.options);
  const d = DEFAULT_WORD_SEARCH_OPTIONS;
  const directions = Array.isArray(raw.directions) ? DIRECTIONS.filter((dir) => (raw.directions as unknown[]).includes(dir)) : d.directions;
  const options: WordSearchOptions = {
    size: clampGridSize(Number(raw.size)),
    directions: directions.length ? directions : ['horizontal'],
    reverse: raw.reverse === true,
    difficulty: oneOf(DIFFICULTIES, raw.difficulty, d.difficulty),
    showWordList: raw.showWordList !== false,
  };

  const grid = Array.isArray(q.grid) ? q.grid : [];
  const validGrid =
    grid.length === options.size && grid.every((row) => typeof row === 'string' && row.length === options.size && /^[A-Z]+$/.test(row));
  if (!validGrid) throw badRequest(`Question ${index + 1}: the word search grid is invalid`);

  const words = (Array.isArray(q.words) ? q.words : [])
    .filter((w): w is string => typeof w === 'string')
    .slice(0, WORD_SEARCH_LIMITS.maxWords)
    .map((w) => w.slice(0, 60));

  const placements: WordPlacement[] = (Array.isArray(q.placements) ? q.placements : [])
    .slice(0, WORD_SEARCH_LIMITS.maxWords)
    .filter(
      (p) =>
        p &&
        typeof p.word === 'string' &&
        [p.row, p.col, p.dr, p.dc].every((n) => Number.isInteger(n)) &&
        Math.abs(p.dr) <= 1 &&
        Math.abs(p.dc) <= 1,
    )
    .map((p) => ({ word: p.word.slice(0, 60), row: p.row, col: p.col, dr: p.dr, dc: p.dc }));

  const wordPoints = wordPointList({ words, wordPoints: Array.isArray(q.wordPoints) ? q.wordPoints : undefined });
  const { wordHashes: _hashes, ...rest } = q;
  return {
    ...rest,
    options,
    words,
    wordPoints,
    points: wordSearchTotal({ words, wordPoints }),
    grid,
    placements,
    seed: seedOf(q.seed),
  };
}

export function cleanMaze(q: MazeQuestion, index: number): MazeQuestion {
  const raw = asObject(q.options);
  const d = DEFAULT_MAZE_OPTIONS;
  const options: MazeOptions = {
    shape: oneOf(SHAPES, raw.shape, d.shape),
    size: oneOf(MAZE_SIZES, raw.size, d.size),
    start: oneOf(ANCHORS, raw.start, d.start),
    end: oneOf(ANCHORS, raw.end, d.end),
  };

  const cells = Array.isArray(q.cells) ? q.cells : [];
  const validCells =
    cells.length > 0 &&
    cells.length <= MAX_MAZE_CELLS &&
    cells.every((row) => typeof row === 'string' && row.length > 0 && row.length <= MAX_MAZE_CELLS && /^[0-9a-f.]+$/.test(row));
  if (!validCells) throw badRequest(`Question ${index + 1}: the maze is invalid`);
  const grid = parseMaze(cells);
  if (!isCell(q.start) || !isCell(q.end) || !isActive(grid, q.start) || !isActive(grid, q.end)) {
    throw badRequest(`Question ${index + 1}: the maze start or end is invalid`);
  }
  return {
    ...q,
    options,
    cells,
    start: [q.start[0], q.start[1]],
    end: [q.end[0], q.end[1]],
    startMarker: cleanMarker(q.startMarker),
    endMarker: cleanMarker(q.endMarker),
    seed: seedOf(q.seed),
  };
}

function cleanMarker(value: unknown): MazeMarker {
  const raw = asObject(value);
  if (raw.type === 'preset' && typeof raw.id === 'string' && /^[a-z0-9-]{1,40}$/.test(raw.id)) return { type: 'preset', id: raw.id };
  if (raw.type === 'image' && typeof raw.url === 'string' && raw.url.length <= 500 && /^(\/uploads\/|https:\/\/)/.test(raw.url)) {
    return { type: 'image', url: raw.url };
  }
  return { type: 'dot' };
}
