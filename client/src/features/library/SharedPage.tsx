import { quizApi } from '@/api/endpoints';
import { useAsync } from '@/lib/useAsync';
import { EmptyState, PageLoader } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { IconPeople } from '@/components/icons';
import { QuizGrid } from './components/QuizGrid';

export function SharedPage() {
  const { data, loading, error, reload } = useAsync(() => quizApi.shared().then((r) => r.quizzes), []);

  return (
    <div className="space-y-8">
      <PageHeader title="Shared with me" description="Quizzes other people have shared with you." />
      {loading && !data ? (
        <PageLoader />
      ) : error ? (
        <p className="text-rose-700">{error}</p>
      ) : data!.length === 0 ? (
        <EmptyState
          icon={IconPeople}
          title="Nothing shared yet"
          description="When someone shares a quiz with your username, it will appear here."
        />
      ) : (
        <QuizGrid quizzes={data!} onChanged={reload} />
      )}
    </div>
  );
}
