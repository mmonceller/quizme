import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ChevronDown, Minus, Pencil, Plus } from 'lucide-react';
import type { QuizVersion, QuizVersionSummary } from '@shared/types';
import { quizApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { useAsync } from '@/lib/useAsync';
import { Avatar, Button, EmptyState, PageLoader, Spinner } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import { QuestionCard } from '@/features/player/components/QuestionCard';
import { ThemedBackdrop } from '@/features/player/theme/ThemedStage';
import { QuizPageHeader, VersionBadge } from './components/QuizPageHeader';
import { IconArrowRight, IconSearchEmpty } from '@/components/icons';

export function VersionsPage() {
  const { quizId = '' } = useParams();
  const { data, loading, error } = useAsync(
    () => Promise.all([quizApi.get(quizId), quizApi.versions(quizId)]).then(([q, v]) => ({ quiz: q.quiz, versions: v.versions })),
    [quizId],
  );

  if (loading) return <PageLoader />;
  if (error || !data) return <EmptyState icon={IconSearchEmpty} title="Couldn't load the version log" description={error} />;
  const { quiz, versions } = data;
  const isOwner = quiz.permission === 'owner';

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <QuizPageHeader
        backTo={quiz.permission === 'view' ? '/shared' : `/quizzes/${quiz.id}/edit`}
        backLabel={quiz.permission === 'view' ? 'Shared with me' : 'Back to editor'}
        eyebrow="Version log"
        title={quiz.title}
      />
      <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
        A new version is created automatically whenever questions are changed after someone has already answered. Each version keeps the
        exact questions and choices participants saw.
      </p>
      <ol className="relative ml-1.5 space-y-4 border-l border-slate-200 pl-7">
        {versions.map((v) => (
          <VersionItem key={v.version} quizId={quiz.id} v={v} current={v.version === quiz.version} showResponses={isOwner} />
        ))}
      </ol>
    </div>
  );
}

function VersionItem({ quizId, v, current, showResponses }: { quizId: string; v: QuizVersionSummary; current: boolean; showResponses: boolean }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState<QuizVersion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setOpen((o) => !o);
    if (!full) {
      try {
        setFull((await quizApi.version(quizId, v.version)).version);
      } catch (err) {
        setError(errorMessage(err));
      }
    }
  };

  return (
    <li className="relative">
      <span
        className={cn(
          'absolute -left-[34px] top-6 h-2.5 w-2.5 rounded-full ring-4 ring-slate-50',
          current ? 'bg-emerald-600' : 'bg-slate-300',
        )}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-base font-semibold text-slate-900">Version {v.version}</span>
              {current && <VersionBadge version={v.version} current />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
              {v.createdBy && <Avatar user={v.createdBy} size={18} />}
              {v.createdBy && `${v.createdBy.firstName} ${v.createdBy.lastName} · `}
              {formatDate(v.createdAt, true)}
            </div>
            {v.note && <p className="mt-3 text-sm text-slate-700">{v.note}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-slate-600">
              <span>{v.questionCount} questions</span>
              {v.changes?.added ? (
                <span className="flex items-center gap-1 text-emerald-700">
                  <Plus className="h-3.5 w-3.5" /> {v.changes.added} added
                </span>
              ) : null}
              {v.changes?.modified ? (
                <span className="flex items-center gap-1 text-amber-700">
                  <Pencil className="h-3.5 w-3.5" /> {v.changes.modified} edited
                </span>
              ) : null}
              {v.changes?.removed ? (
                <span className="flex items-center gap-1 text-rose-700">
                  <Minus className="h-3.5 w-3.5" /> {v.changes.removed} removed
                </span>
              ) : null}
              {showResponses && (
                <Link
                  to={`/quizzes/${quizId}/responses?version=${v.version}`}
                  className="inline-flex items-center gap-1 font-medium text-brand-700 underline-offset-4 hover:underline"
                >
                  {v.responseCount} {v.responseCount === 1 ? 'response' : 'responses'}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={toggle}>
            {open ? 'Hide' : 'View'} questions <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
          </Button>
        </div>
        {open && (
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            {error ? (
              <p className="text-rose-600">{error}</p>
            ) : !full ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : full.snapshot.questions.length === 0 ? (
              <p className="text-sm text-slate-500">No questions in this version.</p>
            ) : (
              <ThemedBackdrop theme={full.snapshot.settings.theme} className="space-y-3">
                {full.snapshot.questions.map((q, i) => (
                  <QuestionCard key={q.id} number={i + 1} question={q} solution={q} settings={full.snapshot.settings} answer={undefined} interactive={false} locked compact />
                ))}
              </ThemedBackdrop>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
