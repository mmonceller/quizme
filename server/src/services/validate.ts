import { withDefaultSettings } from '../../../shared/defaults.ts';
import { isChoiceIconKey } from '../../../shared/choiceLayout.ts';
import type {
  ChoiceColumns,
  ChoiceLabelStyle,
  ChoiceLayout,
  ChoiceSize,
  MultipleChoiceQuestion,
  Question,
  QuestionType,
  QuizSettings,
} from '../../../shared/types.ts';
import { badRequest } from '../utils/http.ts';

const TYPES: QuestionType[] = [
  'multiple_choice',
  'true_false',
  'identification',
  'fill_blank',
  'matching',
  'enumeration',
  'sequencing',
];

export function requireString(value: unknown, field: string, max = 200): string {
  if (typeof value !== 'string' || !value.trim()) throw badRequest(`${field} is required`);
  if (value.length > max) throw badRequest(`${field} must be at most ${max} characters`);
  return value.trim();
}

export function optionalString(value: unknown, max = 2000): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw badRequest('Invalid text value');
  return value.slice(0, max);
}

export function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value)) throw badRequest('Questions must be a list');
  if (value.length > 500) throw badRequest('A quiz can have at most 500 questions');
  const seen = new Set<string>();
  return value.map((raw, i) => {
    const q = raw as Question;
    if (!q || typeof q !== 'object' || typeof q.id !== 'string' || !TYPES.includes(q.type)) {
      throw badRequest(`Question ${i + 1} is invalid`);
    }
    if (seen.has(q.id)) throw badRequest(`Question ${i + 1} has a duplicate id`);
    seen.add(q.id);
    const points = Number(q.points);
    const clean = {
      ...q,
      prompt: typeof q.prompt === 'string' ? q.prompt : '',
      points: Number.isFinite(points) && points >= 0 ? points : 1,
    } as Question;
    return clean.type === 'multiple_choice' ? cleanChoiceLayout(clean) : clean;
  });
}

const LABELS: ChoiceLabelStyle[] = ['letters', 'sign', 'both', 'icons', 'none'];
const COLUMNS: ChoiceColumns[] = ['auto', '1', '2', '3', '4'];
const SIZES: ChoiceSize[] = ['sm', 'md', 'lg', 'xl'];

function cleanChoiceLayout(q: MultipleChoiceQuestion): MultipleChoiceQuestion {
  const raw = (q.layout && typeof q.layout === 'object' ? q.layout : {}) as Partial<ChoiceLayout>;
  const layout: Partial<ChoiceLayout> = {};
  if (LABELS.includes(raw.labels as ChoiceLabelStyle)) layout.labels = raw.labels;
  if (COLUMNS.includes(raw.columns as ChoiceColumns)) layout.columns = raw.columns;
  if (SIZES.includes(raw.size as ChoiceSize)) layout.size = raw.size;
  const choices = Array.isArray(q.choices)
    ? q.choices.map((c) => ({ ...c, icon: isChoiceIconKey(c.icon) ? c.icon : null }))
    : [];
  return { ...q, layout, choices };
}

export function validateSettings(value: unknown): QuizSettings {
  if (value !== undefined && (typeof value !== 'object' || value === null)) throw badRequest('Invalid settings');
  const s = withDefaultSettings(value as Partial<QuizSettings>);
  s.timer.defaultSeconds = Math.min(3600, Math.max(3, Math.round(Number(s.timer.defaultSeconds) || 30)));
  s.theme.overlay = Math.min(0.85, Math.max(0, Number(s.theme.overlay) || 0));
  s.endScreen.title = optionalString(s.endScreen.title, 120);
  s.endScreen.message = optionalString(s.endScreen.message, 1000);
  return s;
}
