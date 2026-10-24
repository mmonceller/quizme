import type { WordPlacement, WordSearchOptions } from '../../types.ts';
import { pick, randInt, seededRng, shuffleWith, type Rng } from '../random.ts';
import { ALL_VECTORS, ALPHABET, WORD_SEARCH_LIMITS, allowedVectors, normalizeWord, type Vector } from './grid.ts';

export interface WordSearchLayout {
  grid: string[];
  placements: WordPlacement[];
  /** Words (as entered) that could not fit. */
  unplaced: string[];
}

type Board = (string | null)[][];

const LAYOUT_ATTEMPTS = 30;
const FILL_ATTEMPTS = 12;

export const clampGridSize = (size: number) =>
  Math.max(WORD_SEARCH_LIMITS.minSize, Math.min(WORD_SEARCH_LIMITS.maxSize, Math.round(size) || 12));

function fits(board: Board, word: string, r: number, c: number, [dr, dc]: Vector, emptyOnly = false): boolean {
  for (let i = 0; i < word.length; i++) {
    const cell = board[r + dr * i]?.[c + dc * i];
    if (cell === undefined) return false;
    if (cell !== null && (emptyOnly || cell !== word[i])) return false;
  }
  return true;
}

function write(board: Board, word: string, r: number, c: number, [dr, dc]: Vector) {
  for (let i = 0; i < word.length; i++) board[r + dr * i][c + dc * i] = word[i];
}

/** Every in-bounds start for the word along the vectors, in random order. */
function candidates(n: number, len: number, vectors: Vector[], rng: Rng): [number, number, Vector][] {
  const out: [number, number, Vector][] = [];
  for (const v of vectors) {
    const [dr, dc] = v;
    for (let r = 0; r < n; r++) {
      const er = r + dr * (len - 1);
      if (er < 0 || er >= n) continue;
      for (let c = 0; c < n; c++) {
        const ec = c + dc * (len - 1);
        if (ec >= 0 && ec < n) out.push([r, c, v]);
      }
    }
  }
  return shuffleWith(rng, out);
}

function place(board: Board, word: string, vectors: Vector[], rng: Rng, emptyOnly = false) {
  for (const [r, c, v] of candidates(board.length, word.length, vectors, rng)) {
    if (fits(board, word, r, c, v, emptyOnly)) {
      write(board, word, r, c, v);
      return { r, c, v };
    }
  }
  return null;
}

/** Look-alikes of a word: missing its last letter, or with one letter swapped for another from the puzzle. */
function decoysFor(word: string, pool: string, rng: Rng): string[] {
  if (word.length < 3) return [];
  const changed = (): string => {
    const i = 1 + randInt(rng, word.length - 1);
    let ch = pick(rng, pool);
    for (let tries = 0; ch === word[i] && tries < 10; tries++) ch = pick(rng, ALPHABET);
    return ch === word[i] ? '' : word.slice(0, i) + ch + word.slice(i + 1);
  };
  return [word.slice(0, -1), changed(), changed()].filter((d) => d.length >= 2);
}

function occurrences(grid: string[], word: string): number {
  const n = grid.length;
  let count = 0;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== word[0]) continue;
      for (const [dr, dc] of ALL_VECTORS) {
        let i = 1;
        while (i < word.length && grid[r + dr * i]?.[c + dc * i] === word[i]) i++;
        if (i === word.length) count++;
      }
    }
  return count;
}

const isPalindrome = (w: string) => w === [...w].reverse().join('');

function fill(board: Board, words: string[], o: WordSearchOptions, rng: Rng): string[] {
  const pool = words.join('') || ALPHABET;
  const filler = () => {
    if (o.difficulty === 'easy') return pick(rng, ALPHABET);
    const fromWords = o.difficulty === 'hard' ? 0.9 : 0.65;
    return rng() < fromWords ? pick(rng, pool) : pick(rng, ALPHABET);
  };
  const work = board.map((row) => [...row]);
  if (o.difficulty === 'hard') {
    const vectors = allowedVectors(o);
    for (const word of shuffleWith(rng, words))
      for (const decoy of decoysFor(word, pool, rng)) place(work, decoy, vectors, rng, true);
  }
  return work.map((row) => row.map((ch) => ch ?? filler()).join(''));
}

/** Filler must not accidentally spell a word a second time. */
function unique(grid: string[], words: string[]): boolean {
  return words.every((w) => occurrences(grid, w) <= (isPalindrome(w) ? 2 : 1));
}

export function generateWordSearch(words: string[], options: WordSearchOptions, seed: number): WordSearchLayout {
  const rng = seededRng(seed);
  const n = clampGridSize(options.size);
  const vectors = allowedVectors(options);

  const seen = new Set<string>();
  const entries: { original: string; word: string }[] = [];
  const unplacedUpfront: string[] = [];
  for (const original of words) {
    const word = normalizeWord(original);
    if (word.length < WORD_SEARCH_LIMITS.minWordLength || seen.has(word)) continue;
    seen.add(word);
    if (word.length > n) unplacedUpfront.push(original);
    else entries.push({ original, word });
  }
  entries.sort((a, b) => b.word.length - a.word.length);

  let best: { board: Board; placements: WordPlacement[]; unplaced: string[] } | null = null;
  for (let attempt = 0; attempt < LAYOUT_ATTEMPTS; attempt++) {
    const board: Board = Array.from({ length: n }, () => Array<string | null>(n).fill(null));
    const placements: WordPlacement[] = [];
    const unplaced: string[] = [];
    for (const { original, word } of entries) {
      const spot = place(board, word, vectors, rng);
      if (spot) placements.push({ word: original, row: spot.r, col: spot.c, dr: spot.v[0], dc: spot.v[1] });
      else unplaced.push(original);
    }
    if (!best || unplaced.length < best.unplaced.length) best = { board, placements, unplaced };
    if (unplaced.length === 0) break;
  }

  const placed = best!.placements.map((p) => normalizeWord(p.word));
  let grid = fill(best!.board, placed, options, rng);
  for (let i = 1; i < FILL_ATTEMPTS && !unique(grid, placed); i++) grid = fill(best!.board, placed, options, rng);

  return { grid, placements: best!.placements, unplaced: [...unplacedUpfront, ...best!.unplaced] };
}
