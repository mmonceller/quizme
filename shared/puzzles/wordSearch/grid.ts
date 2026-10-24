import type { WordDirection, WordPlacement, WordSearchOptions, WordSearchQuestion } from '../../types.ts';

export const WORD_SEARCH_LIMITS = { minSize: 6, maxSize: 20, maxWords: 30, minWordLength: 2 } as const;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** [startRow, startCol, endRow, endCol] */
export type Segment = [number, number, number, number];
export type Vector = [number, number];

const FORWARD: Record<WordDirection, Vector[]> = {
  horizontal: [[0, 1]],
  vertical: [[1, 0]],
  diagonal: [
    [1, 1],
    [-1, 1],
  ],
};

export const ALL_VECTORS: Vector[] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [-1, 1],
  [0, -1],
  [-1, 0],
  [-1, -1],
  [1, -1],
];

/** Uppercase A–Z only; accents are folded (é → E) and everything else is dropped. */
export function normalizeWord(word: string): string {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

export function allowedVectors(o: Pick<WordSearchOptions, 'directions' | 'reverse'>): Vector[] {
  const forward = o.directions.flatMap((d) => FORWARD[d] ?? []);
  const base = forward.length ? forward : FORWARD.horizontal;
  return o.reverse ? [...base, ...base.map(([r, c]): Vector => [-r, -c])] : base;
}

export function isStraight([r1, c1, r2, c2]: Segment): boolean {
  const dr = Math.abs(r2 - r1);
  const dc = Math.abs(c2 - c1);
  return dr === 0 || dc === 0 || dr === dc;
}

export function segmentCells(seg: Segment): [number, number][] {
  if (!isStraight(seg)) return [];
  const [r1, c1, r2, c2] = seg;
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  const len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1));
  return Array.from({ length: len + 1 }, (_, i) => [r1 + dr * i, c1 + dc * i]);
}

export function placementSegment(p: WordPlacement): Segment {
  const len = Math.max(1, normalizeWord(p.word).length);
  return [p.row, p.col, p.row + p.dr * (len - 1), p.col + p.dc * (len - 1)];
}

export function readSegment(grid: string[], seg: Segment): string {
  let out = '';
  for (const [r, c] of segmentCells(seg)) {
    const ch = grid[r]?.[c];
    if (!ch) return '';
    out += ch;
  }
  return out;
}

/** 32-bit FNV-1a, enough to recognize a word without shipping it. */
export function wordHash(word: string): string {
  const s = normalizeWord(word);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

export function isSegment(value: unknown): value is Segment {
  return Array.isArray(value) && value.length === 4 && value.every((n) => Number.isInteger(n));
}

type Matchable = Pick<WordSearchQuestion, 'grid' | 'words' | 'wordHashes'>;

/** Index of the word a selection spells (either way), skipping words already found; -1 if none. */
export function matchSegment(q: Matchable, seg: Segment, found: ReadonlySet<number> = new Set()): number {
  const text = readSegment(q.grid, seg);
  if (text.length < WORD_SEARCH_LIMITS.minWordLength) return -1;
  const forward = wordHash(text);
  const backward = wordHash([...text].reverse().join(''));
  const keys = q.wordHashes ?? q.words.map(wordHash);
  return keys.findIndex((k, i) => !found.has(i) && (k === forward || k === backward));
}

/** Which words a list of selections found, as word index → segment. */
export function foundWords(q: Matchable, segments: unknown): Map<number, Segment> {
  const found = new Map<number, Segment>();
  if (!Array.isArray(segments)) return found;
  for (const seg of segments) {
    if (!isSegment(seg)) continue;
    const i = matchSegment(q, seg, new Set(found.keys()));
    if (i >= 0) found.set(i, seg);
  }
  return found;
}
