import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { libraryApi, quizApi } from '@/api/endpoints';
import { useUser } from '@/context/AuthContext';
import { useAsync } from '@/lib/useAsync';
import { Button, EmptyState, PageLoader } from '@/components/ui';
import { PageHeader, SectionTitle } from '@/components/layout/PageHeader';
import { IconLayers } from '@/components/icons';
import { GroupCard } from './components/GroupCard';
import { GroupFormModal } from './components/GroupFormModal';
import { QuizGrid } from './components/QuizGrid';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function HomePage() {
  const user = useUser();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const { data, loading, error, reload } = useAsync(
    () => Promise.all([libraryApi.groups(), quizApi.recent()]).then(([g, r]) => ({ groups: g.groups, recent: r.quizzes })),
    [],
  );

  if (loading && !data) return <PageLoader />;
  if (error) return <p className="text-rose-700">{error}</p>;
  const { groups, recent } = data!;

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow={`${greeting()}, ${user.firstName}`}
        title="Your library"
        actions={
          <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>
            New group
          </Button>
        }
      />

      <section>
        <SectionTitle>Groups</SectionTitle>
        {groups.length === 0 ? (
          <EmptyState
            icon={IconLayers}
            title="Create your first group"
            description="Groups keep things organized. Make one per subject, class, or event, then add folders and quizzes inside."
            action={
              <Button onClick={() => setCreating(true)} icon={<Plus className="h-4 w-4" />}>
                New group
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
            <button
              onClick={() => setCreating(true)}
              className="flex min-h-[132px] items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 transition-colors hover:border-slate-400 hover:bg-white hover:text-slate-800"
            >
              <Plus className="h-4 w-4" />
              New group
            </button>
          </div>
        )}
      </section>

      {recent.length > 0 && (
        <section>
          <SectionTitle>Recently edited</SectionTitle>
          <QuizGrid quizzes={recent} onChanged={reload} />
        </section>
      )}

      <GroupFormModal open={creating} onClose={() => setCreating(false)} onSaved={(g) => navigate(`/groups/${g.id}`)} />
    </div>
  );
}
