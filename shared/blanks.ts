export type BlankSegment =
  | { kind: 'text'; value: string }
  | { kind: 'blank'; index: number; answers: string[] };

const BLANK_RE = /\[\[(.*?)\]\]/g;

export function parseBlanks(text: string): BlankSegment[] {
  const segments: BlankSegment[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(BLANK_RE)) {
    const start = match.index ?? 0;
    if (start > last) segments.push({ kind: 'text', value: text.slice(last, start) });
    const answers = match[1]
      .split('|')
      .map((a) => a.trim())
      .filter(Boolean);
    segments.push({ kind: 'blank', index: index++, answers });
    last = start + match[0].length;
  }
  if (last < text.length) segments.push({ kind: 'text', value: text.slice(last) });
  return segments;
}

export function countBlanks(text: string): number {
  return parseBlanks(text).filter((s) => s.kind === 'blank').length;
}

const MASK = '\u2022';
const MASK_RE = new RegExp(`^${MASK}+$`);

/**
 * Replaces every blank's answers with a same-length mask so the sentence can be shown
 * (with proportionally sized blanks) without revealing the answers.
 */
export function hideBlankAnswers(text: string): string {
  return text.replace(BLANK_RE, (_, inner: string) => {
    const longest = Math.max(1, ...inner.split('|').map((a) => a.trim().length));
    return `[[${MASK.repeat(longest)}]]`;
  });
}

export const isMaskedBlank = (answers: string[]) => answers.length === 1 && MASK_RE.test(answers[0]);

/** Text whose rendered width sets the blank's line length: the longest answer, or an average-width stand-in when masked. */
export function blankSizerText(answers: string[]): string {
  if (!answers.length) return 'xxxxx';
  if (isMaskedBlank(answers)) return 'n'.repeat(answers[0].length);
  return answers.reduce((a, b) => (b.length > a.length ? b : a));
}
