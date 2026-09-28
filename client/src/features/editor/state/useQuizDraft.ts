import { useCallback, useMemo, useState } from 'react';
import type { Question, QuestionType, Quiz, QuizSettings } from '@shared/types';
import { moveItem } from '@/lib/utils';
import { cloneQuestion, createQuestion } from './questionFactory';

export interface Draft {
  title: string;
  description: string;
  questions: Question[];
  settings: QuizSettings;
}

const toDraft = (q: Quiz): Draft => ({
  title: q.title,
  description: q.description,
  questions: q.questions,
  settings: q.settings,
});

export function useQuizDraft(quiz: Quiz) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(quiz));
  const [saved, setSaved] = useState<Draft>(() => toDraft(quiz));

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const questionsChanged = useMemo(
    () => JSON.stringify(draft.questions) !== JSON.stringify(saved.questions),
    [draft.questions, saved.questions],
  );

  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), []);

  const updateQuestion = useCallback((id: string, p: Partial<Question>) => {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q) => (q.id === id ? ({ ...q, ...p } as Question) : q)),
    }));
  }, []);

  const addQuestion = useCallback((type: QuestionType, atIndex?: number) => {
    const q = createQuestion(type);
    setDraft((d) => {
      const list = [...d.questions];
      list.splice(atIndex ?? list.length, 0, q);
      return { ...d, questions: list };
    });
    return q;
  }, []);

  const duplicateQuestion = useCallback((original: Question) => {
    const copy = cloneQuestion(original);
    setDraft((d) => {
      const list = [...d.questions];
      list.splice(list.findIndex((q) => q.id === original.id) + 1, 0, copy);
      return { ...d, questions: list };
    });
    return copy;
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setDraft((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== id) }));
  }, []);

  const moveQuestion = useCallback((from: number, to: number) => {
    setDraft((d) => ({ ...d, questions: moveItem(d.questions, from, to) }));
  }, []);

  const updateSettings = useCallback((p: Partial<QuizSettings>) => {
    setDraft((d) => ({ ...d, settings: { ...d.settings, ...p } }));
  }, []);

  const markSaved = useCallback((q: Quiz) => {
    const next = toDraft(q);
    setSaved(next);
    setDraft(next);
  }, []);

  return {
    draft,
    dirty,
    questionsChanged,
    patch,
    updateQuestion,
    addQuestion,
    duplicateQuestion,
    removeQuestion,
    moveQuestion,
    updateSettings,
    markSaved,
  };
}

export type QuizDraftApi = ReturnType<typeof useQuizDraft>;
