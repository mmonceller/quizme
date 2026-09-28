import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { gradeQuestion, gradeQuiz } from '@shared/grading';
import { quizApi } from '@/api/endpoints';
import { useAsync } from '@/lib/useAsync';
import { EmptyState, PageLoader, Button } from '@/components/ui';
import { IconSearchEmpty } from '@/components/icons';
import { QuizPlayer } from '../QuizPlayer';
import { prepareQuestions } from '../engine/prepare';

/** Owner / collaborator play-through ("play") or big-screen presentation ("present"). */
export function PlayPage({ mode }: { mode: 'play' | 'present' }) {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const { data: quiz, loading, error } = useAsync(() => quizApi.get(quizId).then((r) => r.quiz), [quizId]);

  const questions = useMemo(() => (quiz ? prepareQuestions(quiz.questions, quiz.settings, false) : []), [quiz]);
  const originals = useMemo(() => new Map(quiz?.questions.map((q) => [q.id, q])), [quiz]);

  if (loading) return <PageLoader />;
  if (error || !quiz)
    return (
      <div className="mx-auto max-w-2xl p-6 sm:py-16">
        <EmptyState icon={IconSearchEmpty} title="Quiz not found" description={error} action={<Button onClick={() => navigate('/')}>Go to library</Button>} />
      </div>
    );

  const exit = () => (window.history.length > 1 ? navigate(-1) : navigate('/'));

  return (
    <QuizPlayer
      key={mode}
      title={quiz.title}
      questions={questions}
      settings={quiz.settings}
      mode={mode}
      onExit={exit}
      reviewQuestions={quiz.questions}
      reveal={async (q, answer) => {
        const full = originals.get(q.id)!;
        return { question: full, result: gradeQuestion(full, answer as never) };
      }}
      onFinish={async (answers) => gradeQuiz(quiz.questions, answers)}
    />
  );
}
