import { useNavigate, useParams } from 'react-router';
import { quizApi } from '@/api/endpoints';
import { useAsync } from '@/lib/useAsync';
import { Button, EmptyState, PageLoader } from '@/components/ui';
import { IconEye, IconSearchEmpty } from '@/components/icons';
import { QuizEditor } from './QuizEditor';

export function QuizEditorPage() {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const { data: quiz, loading, error } = useAsync(() => quizApi.get(quizId).then((r) => r.quiz), [quizId]);

  if (loading) return <PageLoader label="Opening quiz…" />;
  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-2xl p-6 sm:py-16">
        <EmptyState icon={IconSearchEmpty} title="Quiz not found" description={error} action={<Button onClick={() => navigate('/')}>Go to library</Button>} />
      </div>
    );
  }
  if (quiz.permission === 'view') {
    return (
      <div className="mx-auto max-w-2xl p-6 sm:py-16">
        <EmptyState
          icon={IconEye}
          title="You have view-only access"
          description="Ask the owner for edit access, or copy it to your library to make your own version."
          action={<Button onClick={() => navigate(`/quizzes/${quiz.id}/play`)}>Play quiz</Button>}
        />
      </div>
    );
  }
  return <QuizEditor key={quiz.id} quiz={quiz} />;
}
