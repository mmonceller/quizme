import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Download, Globe, History, Search, Share2 } from 'lucide-react';
import { quizApi } from '@/api/endpoints';
import { useAsync } from '@/lib/useAsync';
import { Button, Card, EmptyState, Input, PageLoader, Select } from '@/components/ui';
import { formatDate, formatDuration } from '@/lib/utils';
import { ShareModal } from '@/features/library/components/ShareModal';
import { QuizPageHeader, ScorePill, VersionBadge } from './components/QuizPageHeader';
import { downloadResponsesCsv } from './csv';
import { IconInbox, IconSearchEmpty } from '@/components/icons';

function age(birthday: string) {
  const b = new Date(birthday);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
}

export function ResponsesPage() {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const versionFilter = params.get('version') ?? 'all';
  const [search, setSearch] = useState('');
  const [sharing, setSharing] = useState(false);

  const { data, loading, error, reload } = useAsync(
    () => Promise.all([quizApi.get(quizId), quizApi.responses(quizId)]).then(([q, r]) => ({ quiz: q.quiz, responses: r.responses })),
    [quizId],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const s = search.trim().toLowerCase();
    return data.responses.filter(
      (r) => (versionFilter === 'all' || r.version === Number(versionFilter)) && (!s || r.participantName.toLowerCase().includes(s)),
    );
  }, [data, versionFilter, search]);

  if (loading && !data) return <PageLoader />;
  if (error || !data) return <EmptyState icon={IconSearchEmpty} title="Couldn't load responses" description={error} />;
  const { quiz, responses } = data;

  const versions = [...new Set(responses.map((r) => r.version))].sort((a, b) => b - a);
  const avg = filtered.length ? filtered.reduce((sum, r) => sum + (r.maxScore ? r.score / r.maxScore : 0), 0) / filtered.length : 0;
  const best = filtered.reduce((m, r) => Math.max(m, r.maxScore ? r.score / r.maxScore : 0), 0);

  return (
    <div className="space-y-8">
      <QuizPageHeader
        backTo={`/quizzes/${quiz.id}/edit`}
        backLabel="Back to editor"
        eyebrow="Responses"
        title={quiz.title}
        actions={
          <>
            <Link to={`/quizzes/${quiz.id}/versions`}>
              <Button variant="secondary" icon={<History className="h-4 w-4" />}>
                Version log
              </Button>
            </Link>
            <Button variant="secondary" onClick={() => downloadResponsesCsv(quiz.title, filtered)} disabled={!filtered.length} icon={<Download className="h-4 w-4" />}>
              Export CSV
            </Button>
          </>
        }
      />

      {!quiz.publicEnabled && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <Globe className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="flex-1">Turn on the public participant link to start collecting responses.</span>
          <Button size="sm" variant="secondary" onClick={() => setSharing(true)} icon={<Share2 className="h-4 w-4" />}>
            Share link
          </Button>
        </div>
      )}

      <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {[
          { label: 'Responses', value: filtered.length },
          { label: 'Average score', value: `${Math.round(avg * 100)}%` },
          { label: 'Top score', value: `${Math.round(best * 100)}%` },
        ].map((s) => (
          <div key={s.label} className="px-4 py-4 sm:px-6 sm:py-5">
            <dt className="text-xs text-slate-500 sm:text-[13px]">{s.label}</dt>
            <dd className="mt-1 font-serif text-3xl tabular-nums text-slate-900 sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      {responses.length === 0 ? (
        <EmptyState icon={IconInbox} title="No responses yet" description="When participants finish the quiz through your public link, their names and scores appear here." />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 p-3 sm:p-4">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" className="pl-9" />
            </div>
            <Select value={versionFilter} onChange={(e) => setParams(e.target.value === 'all' ? {} : { version: e.target.value })} className="w-full sm:w-44">
              <option value="all">All versions</option>
              {versions.map((v) => (
                <option key={v} value={v}>
                  Version {v}
                  {v === quiz.version ? ' (current)' : ''}
                </option>
              ))}
            </Select>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Participant</th>
                  <th className="px-5 py-2.5 font-medium">Birthday</th>
                  <th className="px-5 py-2.5 font-medium">Score</th>
                  <th className="px-5 py-2.5 font-medium">Version</th>
                  <th className="px-5 py-2.5 font-medium">Time taken</th>
                  <th className="px-5 py-2.5 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 [&_td]:px-5 [&_td]:py-3">
                {filtered.map((r) => (
                  <tr key={r.id} onClick={() => navigate(r.id)} className="cursor-pointer transition-colors hover:bg-slate-50">
                    <td className="font-medium text-slate-900">{r.participantName}</td>
                    <td className="text-slate-600">
                      {formatDate(r.birthday)} <span className="text-slate-400">({age(r.birthday)})</span>
                    </td>
                    <td>
                      <ScorePill score={r.score} max={r.maxScore} />
                    </td>
                    <td>
                      <VersionBadge version={r.version} current={r.version === quiz.version} />
                    </td>
                    <td className="tabular-nums text-slate-600">{formatDuration(r.durationSeconds)}</td>
                    <td className="text-slate-600">{formatDate(r.submittedAt, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden">
            {filtered.map((r) => (
              <li key={r.id}>
                <Link to={r.id} className="flex items-center gap-3 p-4 active:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900">{r.participantName}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <VersionBadge version={r.version} current={r.version === quiz.version} />
                      {formatDate(r.submittedAt, true)}
                    </div>
                  </div>
                  <ScorePill score={r.score} max={r.maxScore} />
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No responses match your filters.</p>}
        </Card>
      )}

      {sharing && (
        <ShareModal
          open
          onClose={() => {
            setSharing(false);
            reload();
          }}
          quizId={quiz.id}
        />
      )}
    </div>
  );
}
