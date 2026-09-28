import type { Question } from '@shared/types';

export function excerpt(q: Question) {
  const text = q.type === 'fill_blank' && !q.prompt.trim() ? q.text.replace(/\[\[(.*?)\]\]/g, '___') : q.prompt;
  return text.trim() || 'Untitled question';
}
