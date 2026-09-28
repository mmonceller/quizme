import { Link, useNavigate, useParams } from 'react-router';
import { Cake, Clock, History, Trash2 } from 'lucide-react';
import { quizApi } from '@/api/endpoints';
import { useAsync } from '@/lib/useAsync';
import { useConfirm } from '@/components/feedback/ConfirmProvider';
import { useToast } from '@/components/feedback/ToastProvider';
import { Button, Card, EmptyState, PageLoader } from '@/components/ui';
import { cn, formatDate, formatDuration } from '@/lib/utils';
import { IconCheckCircle, IconCrossCircle, IconPartialCircle, IconSearchEmpty } from '@/components/icons';
import { QuestionCard } from '@/features/player/components/QuestionCard';
import { ThemedBackdrop } from '@/features/player/theme/ThemedStage';
import { QuizPageHeader, ScorePill, VersionBadge } from './components/QuizPageHeader';

export function ResponseDetailPage() {
  const { quizId = '', responseId = '' } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  const { data, loading, error } = useAsync(
    () => Promise.all([quizApi.get(quizId), quizApi.response(quizId, responseId)]).then(([q, r]) => ({ quiz: q.quiz, response: r.response })),
    [quizId, responseId],
  );

  if (loading) return <PageLoader />;
  if (error || !data) return <EmptyState icon={IconSearchEmpty} title="Response not found" description={error} />;
  const { quiz, response: r } = data;
  const outdated = r.version !== quiz.version;

  const remove = async () => {
    if (!(await confirm({ title: `Delete ${r.participantName}'s response?`, confirmLabel: 'Delete', danger: true }))) return;
    await quizApi.deleteResponse(quiz.id, r.id);
    toast('Response deleted');
    navigate(`/quizzes/${quiz.id}/responses`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <QuizPageHeader
        backTo={`/quizzes/${quiz.id}/responses`}
        backLabel="All responses"
        eyebrow={quiz.title}
        title={r.participantName}
        actions={
          <Button variant="secondary" onClick={remove} icon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
        }
      />

      <Card className="!p-0">
        <dl className="grid grid-cols-2 divide-slate-200 sm:grid-cols-4 sm:divide-x [&>div]:px-5 [&>div]:py-4">
          <div>
            <dt className="text-xs text-slate-500">Score</dt>
            <dd className="mt-1.5">
              <ScorePill score={r.score} max={r.maxScore} />
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <Cake className="h-3.5 w-3.5" /> Birthday
            </dt>
            <dd className="mt-1.5 text-sm text-slate-900">{formatDate(r.birthday)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Time taken
            </dt>
            <dd className="mt-1.5 text-sm tabular-nums text-slate-900">{formatDuration(r.durationSeconds)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Submitted</dt>
            <dd className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-900">
              {formatDate(r.submittedAt, true)} <VersionBadge version={r.version} current={!outdated} />
            </dd>
          </div>
        </dl>
        {outdated && (
          <div className="flex flex-wrap items-center gap-3 border-t border-amber-200 bg-amber-50/70 px-5 py-3 text-sm text-amber-900 sm:rounded-b-xl">
            <History className="h-4 w-4 shrink-0" />
            <span className="flex-1">
              The quiz is now on version {quiz.version}. Below are the original questions and choices from version {r.version}, exactly as this
              participant saw them.
            </span>
            <Link to={`/quizzes/${quiz.id}/versions`} className="font-medium underline underline-offset-4">
              Version log
            </Link>
          </div>
        )}
      </Card>

      <ThemedBackdrop theme={r.snapshot.settings.theme} className="space-y-6">
        {r.snapshot.questions.map((q, i) => {
          const res = r.results[q.id];
          const status = res?.correct ? 'correct' : res?.earned ? 'partial' : 'wrong';
          const StatusIcon = status === 'correct' ? IconCheckCircle : status === 'partial' ? IconPartialCircle : IconCrossCircle;
          return (
            <div key={q.id}>
              <div className="mb-2 flex items-center gap-2 text-[13px] font-medium">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md py-1 pl-1.5 pr-2.5 text-white',
                    status === 'correct' && 'bg-emerald-700',
                    status === 'partial' && 'bg-amber-600',
                    status === 'wrong' && 'bg-rose-700',
                  )}
                >
                  <StatusIcon className="h-4 w-4" />
                  {status === 'correct' ? 'Correct' : status === 'partial' ? 'Partly correct' : 'Incorrect'}
                </span>
                <span className="rounded-md bg-black/40 px-2.5 py-1 tabular-nums text-white">
                  {res?.earned ?? 0} / {res?.max ?? q.points} pts
                </span>
              </div>
              <QuestionCard number={i + 1} question={q} solution={q} settings={r.snapshot.settings} answer={r.answers[q.id]} interactive locked compact />
            </div>
          );
        })}
      </ThemedBackdrop>
    </div>
  );
}
