import { useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router';
import type { PublicQuiz } from '@shared/types';
import { publicApi } from '@/api/endpoints';
import { useAsync } from '@/lib/useAsync';
import { isLight } from '@/lib/color';
import { PageLoader } from '@/components/ui';
import { QuizPlayer } from '../QuizPlayer';
import { prepareQuestions } from '../engine/prepare';
import { ThemedCard, ThemedStage } from '../theme/ThemedStage';
import { IconArrowRight, IconClipboard, IconLock } from '@/components/icons';

/** Public participant link: collects name + birthday, then runs the quiz and submits results to the owner. */
export function PublicPlayPage() {
  const { token = '' } = useParams();
  const { data: quiz, loading, error } = useAsync(() => publicApi.get(token).then((r) => r.quiz), [token]);
  const [participant, setParticipant] = useState<{ name: string; birthday: string } | null>(null);
  const questions = useMemo(() => (quiz ? prepareQuestions(quiz.questions, quiz.settings, true) : []), [quiz]);

  if (loading) return <PageLoader />;
  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
            <IconLock className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-serif text-3xl text-slate-900">Quiz unavailable</h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <ThemedStage theme={quiz.settings.theme} className="flex items-center justify-center p-4">
        <IntroForm quiz={quiz} onStart={setParticipant} />
      </ThemedStage>
    );
  }

  return (
    <QuizPlayer
      title={quiz.title}
      questions={questions}
      settings={quiz.settings}
      mode="public"
      reveal={async (q, answer) => publicApi.check(token, quiz.version, q.id, answer)}
      onFinish={(answers, durationSeconds) =>
        publicApi.submit(token, {
          version: quiz.version,
          participantName: participant.name,
          birthday: participant.birthday,
          answers,
          durationSeconds,
        })
      }
    />
  );
}

function IntroForm({ quiz, onStart }: { quiz: PublicQuiz; onStart: (p: { name: string; birthday: string }) => void }) {
  const theme = quiz.settings.theme;
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() && birthday) onStart({ name: name.trim(), birthday });
  };

  const inputStyle = {
    background: theme.choiceBg,
    color: theme.choiceText,
    borderColor: `${theme.accent}55`,
    colorScheme: isLight(theme.choiceText) ? 'dark' : 'light',
  } as const;

  return (
    <ThemedCard theme={theme} className="w-full max-w-md animate-pop p-6 sm:p-8">
      <div className="text-center">
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: `${theme.accent}1f`, color: theme.accent }}
        >
          <IconClipboard className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">{quiz.title}</h1>
        {quiz.description && <p className="mt-2 opacity-75">{quiz.description}</p>}
        <p className="mt-3 text-sm opacity-60">
          {quiz.questions.length} questions{quiz.ownerName && ` · by ${quiz.ownerName}`}
        </p>
      </div>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            placeholder="First and last name"
            className="h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-current/20"
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Birthday</span>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
            max={today}
            className="h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-current/20"
            style={inputStyle}
          />
        </label>
        <button
          type="submit"
          className="!mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: theme.accent }}
        >
          Start quiz <IconArrowRight className="h-4.5 w-4.5" />
        </button>
        <p className="text-center text-xs opacity-60">Your name, birthday, answers and score will be shared with the quiz owner.</p>
      </form>
    </ThemedCard>
  );
}
