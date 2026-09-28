import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ChevronRight, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Folder } from '@shared/types';
import { libraryApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { useAsync } from '@/lib/useAsync';
import { useToast } from '@/components/feedback/ToastProvider';
import { useConfirm } from '@/components/feedback/ConfirmProvider';
import { Button, EmptyState, Menu, PageLoader } from '@/components/ui';
import { PageHeader, SectionTitle } from '@/components/layout/PageHeader';
import { GroupIcon, IconDocument, IconSearchEmpty } from '@/components/icons';
import { GroupBadge } from './components/GroupBadge';
import { FolderCard } from './components/FolderCard';
import { FolderTree } from './components/FolderTree';
import { GroupFormModal } from './components/GroupFormModal';
import { NameModal } from './components/NameModal';
import { CreateQuizModal } from './components/CreateQuizModal';
import { QuizGrid } from './components/QuizGrid';

export function GroupPage() {
  const { groupId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const folderId = params.get('folder');
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, setData, loading, error, reload } = useAsync(() => libraryApi.group(groupId), [groupId]);

  const [editingGroup, setEditingGroup] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [renaming, setRenaming] = useState<Folder | null>(null);
  const [newQuiz, setNewQuiz] = useState(false);

  const openFolder = (id: string | null) => setParams(id ? { folder: id } : {});

  const breadcrumb = useMemo(() => {
    if (!data || !folderId) return [];
    const chain: Folder[] = [];
    let cur = data.folders.find((f) => f.id === folderId);
    while (cur) {
      chain.unshift(cur);
      cur = data.folders.find((f) => f.id === cur!.parentId);
    }
    return chain;
  }, [data, folderId]);

  if (loading && !data) return <PageLoader />;
  if (error || !data)
    return (
      <EmptyState
        icon={IconSearchEmpty}
        title="Group not found"
        description={error}
        action={
          <Link to="/">
            <Button>Back to library</Button>
          </Link>
        }
      />
    );

  const { group, folders, quizzes } = data;
  const subfolders = folders.filter((f) => f.parentId === folderId);
  const visibleQuizzes = quizzes.filter((q) => q.folderId === folderId);
  const itemCount = (id: string) =>
    folders.filter((f) => f.parentId === id).length + quizzes.filter((q) => q.folderId === id).length;

  const deleteFolder = async (f: Folder) => {
    const ok = await confirm({
      title: `Delete folder “${f.name}”?`,
      message: 'Everything inside it — subfolders and quizzes — will be permanently deleted.',
      confirmLabel: 'Delete folder',
      danger: true,
    });
    if (!ok) return;
    try {
      await libraryApi.deleteFolder(f.id);
      if (breadcrumb.some((b) => b.id === f.id)) openFolder(f.parentId);
      toast('Folder deleted');
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const deleteGroup = async () => {
    const ok = await confirm({
      title: `Delete group “${group.name}”?`,
      message: `All ${folders.length} folders and ${quizzes.length} quizzes in this group will be permanently deleted.`,
      confirmLabel: 'Delete group',
      danger: true,
    });
    if (!ok) return;
    await libraryApi.deleteGroup(group.id);
    toast('Group deleted');
    navigate('/');
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div className="mb-3 px-2 text-[13px] font-medium uppercase tracking-wider text-slate-500">Folders</div>
          <FolderTree
            folders={folders}
            selectedId={folderId}
            onSelect={openFolder}
            rootLabel={
              <span className="flex min-w-0 items-center gap-2">
                <GroupIcon icon={group.icon} className="h-4 w-4 shrink-0" style={{ color: group.color }} />
                <span className="truncate">{group.name}</span>
              </span>
            }
          />
        </div>
      </aside>

      <div className="min-w-0 space-y-10">
        <PageHeader
          leading={
            <span className="hidden sm:block">
              <GroupBadge color={group.color} size="lg">
                <GroupIcon icon={group.icon} className="h-7 w-7" />
              </GroupBadge>
            </span>
          }
          eyebrow={
            <nav className="flex flex-wrap items-center gap-1">
              <Link to="/" className="hover:text-slate-900">
                Library
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <button onClick={() => openFolder(null)} className="hover:text-slate-900">
                {group.name}
              </button>
              {breadcrumb.map((f) => (
                <span key={f.id} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <button onClick={() => openFolder(f.id)} className="hover:text-slate-900">
                    {f.name}
                  </button>
                </span>
              ))}
            </nav>
          }
          title={breadcrumb.at(-1)?.name ?? group.name}
          actions={
            <>
              <Button variant="secondary" onClick={() => setNewFolder(true)} icon={<FolderPlus className="h-4 w-4" />}>
                <span className="hidden sm:inline">New folder</span>
              </Button>
              <Button onClick={() => setNewQuiz(true)} icon={<Plus className="h-4 w-4" />}>
                New quiz
              </Button>
              <Menu
                items={[
                  { label: 'Edit group', icon: <Pencil />, onClick: () => setEditingGroup(true) },
                  { label: 'Delete group', icon: <Trash2 />, onClick: deleteGroup, danger: true },
                ]}
              />
            </>
          }
        />

        {subfolders.length > 0 && (
          <section>
            <SectionTitle>Folders</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {subfolders.map((f) => (
                <FolderCard
                  key={f.id}
                  folder={f}
                  count={itemCount(f.id)}
                  color={group.color}
                  onOpen={() => openFolder(f.id)}
                  onRename={() => setRenaming(f)}
                  onDelete={() => deleteFolder(f)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle>Quizzes</SectionTitle>
          {visibleQuizzes.length === 0 ? (
            <EmptyState
              icon={IconDocument}
              title={subfolders.length ? 'No quizzes here yet' : 'This space is empty'}
              description="Create a quiz here, or organize with folders (folders can hold other folders, too)."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="secondary" onClick={() => setNewFolder(true)} icon={<FolderPlus className="h-4 w-4" />}>
                    New folder
                  </Button>
                  <Button onClick={() => setNewQuiz(true)} icon={<Plus className="h-4 w-4" />}>
                    New quiz
                  </Button>
                </div>
              }
            />
          ) : (
            <QuizGrid quizzes={visibleQuizzes} onChanged={reload} />
          )}
        </section>
      </div>

      <GroupFormModal
        open={editingGroup}
        onClose={() => setEditingGroup(false)}
        group={group}
        onSaved={(g) => setData({ ...data, group: g })}
      />
      <NameModal
        open={newFolder}
        onClose={() => setNewFolder(false)}
        title={folderId ? `New folder in “${breadcrumb.at(-1)?.name}”` : 'New folder'}
        label="Folder name"
        placeholder="e.g. Chapter 1"
        confirmLabel="Create folder"
        onSubmit={async (name) => {
          await libraryApi.createFolder(group.id, folderId, name);
          reload();
        }}
      />
      <NameModal
        open={!!renaming}
        onClose={() => setRenaming(null)}
        title="Rename folder"
        label="Folder name"
        initial={renaming?.name}
        onSubmit={async (name) => {
          await libraryApi.renameFolder(renaming!.id, name);
          reload();
        }}
      />
      <CreateQuizModal open={newQuiz} onClose={() => setNewQuiz(false)} groupId={group.id} folderId={folderId} />
    </div>
  );
}
