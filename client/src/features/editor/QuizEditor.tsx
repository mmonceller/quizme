import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  BarChart3,
  Eye,
  History,
  ListChecks,
  Palette,
  Play,
  Plus,
  Presentation,
  Save,
  Settings2,
  Share2,
} from 'lucide-react';
import { IconListAdd } from '@/components/icons';
import type { Quiz } from '@shared/types';
import { quizApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { useToast } from '@/components/feedback/ToastProvider';
import { useConfirm } from '@/components/feedback/ConfirmProvider';
import { Button, EmptyState, Menu, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ShareModal } from '@/features/library/components/ShareModal';
import { useQuizDraft } from './state/useQuizDraft';
import { QuestionList } from './components/questionList';
import { QuestionEditor } from './components/QuestionEditor';
import { AddQuestionModal } from './components/AddQuestionModal';
import { LivePreview } from './components/LivePreview';
import { SaveVersionModal } from './components/SaveVersionModal';
import { DesignPanel } from './panels/DesignPanel';
import { SettingsPanel } from './panels/SettingsPanel';

type Tab = 'questions' | 'design' | 'settings';

const TABS: { value: Tab; label: string; icon: typeof ListChecks }[] = [
  { value: 'questions', label: 'Questions', icon: ListChecks },
  { value: 'design', label: 'Design', icon: Palette },
  { value: 'settings', label: 'Settings', icon: Settings2 },
];

export function QuizEditor({ quiz: initial }: { quiz: Quiz }) {
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const [quiz, setQuiz] = useState(initial);
  const d = useQuizDraft(initial);
  const { draft } = d;

  const [tab, setTab] = useState<Tab>('questions');
  const [selectedId, setSelectedId] = useState<string | null>(initial.questions[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [versionPrompt, setVersionPrompt] = useState<{ forced: boolean } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isOwner = quiz.permission === 'owner';
  const selectedIndex = draft.questions.findIndex((q) => q.id === selectedId);
  const selected = draft.questions[selectedIndex];

  useEffect(() => {
    if (!selected && draft.questions.length) setSelectedId(draft.questions[0].id);
  }, [selected, draft.questions]);

  const doSave = useCallback(
    async (opts: { versionNote?: string; forceNewVersion?: boolean } = {}) => {
      if (!draft.title.trim()) {
        toast('Give your quiz a name first (Settings tab)', 'error');
        setTab('settings');
        return;
      }
      setSaving(true);
      try {
        const res = await quizApi.save(quiz.id, { ...draft, ...opts });
        setQuiz(res.quiz);
        d.markSaved(res.quiz);
        toast(res.versionCreated ? `Saved as version ${res.version}` : 'Saved');
      } catch (err) {
        toast(errorMessage(err), 'error');
      } finally {
        setSaving(false);
      }
    },
    [draft, quiz.id, d, toast],
  );

  const save = useCallback(() => {
    if (d.questionsChanged && quiz.responsesOnCurrentVersion > 0) setVersionPrompt({ forced: false });
    else void doSave();
  }, [d.questionsChanged, quiz.responsesOnCurrentVersion, doSave]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (d.dirty && !saving) save();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (d.dirty) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, [d.dirty, saving, save]);

  const leave = async (to: string) => {
    if (d.dirty && !(await confirm({ title: 'Leave without saving?', message: 'Your unsaved changes will be lost.', confirmLabel: 'Leave', danger: true }))) return;
    navigate(to);
  };

  const backTo = isOwner ? `/groups/${quiz.groupId}${quiz.folderId ? `?folder=${quiz.folderId}` : ''}` : '/shared';

  const deleteQuestion = async (id: string) => {
    if (!(await confirm({ title: 'Delete this question?', confirmLabel: 'Delete', danger: true }))) return;
    const idx = draft.questions.findIndex((q) => q.id === id);
    d.removeQuestion(id);
    const neighbor = draft.questions[idx + 1] ?? draft.questions[idx - 1];
    setSelectedId(neighbor?.id ?? null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <Button variant="ghost" size="icon" onClick={() => leave(backTo)} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />
          <div className="min-w-0 flex-1">
            <input
              value={draft.title}
              onChange={(e) => d.patch({ title: e.target.value })}
              className="w-full truncate rounded-md bg-transparent px-1.5 py-0.5 font-display text-[15px] font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:bg-slate-100"
              aria-label="Quiz name"
            />
            <div className="flex items-center gap-2 px-1.5 text-xs text-slate-500">
              <span className="tabular-nums">v{quiz.version}</span>
              <span className="text-slate-300">·</span>
              <span>
                {draft.questions.length} {draft.questions.length === 1 ? 'question' : 'questions'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', d.dirty ? 'bg-amber-500' : 'bg-emerald-500')} />
                {d.dirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="secondary" onClick={() => leave(`/quizzes/${quiz.id}/play`)} icon={<Play className="h-4 w-4" />}>
              Play
            </Button>
            <Button variant="secondary" onClick={() => leave(`/quizzes/${quiz.id}/present`)} icon={<Presentation className="h-4 w-4" />}>
              Present
            </Button>
            {isOwner && (
              <Button variant="secondary" onClick={() => setSharing(true)} icon={<Share2 className="h-4 w-4" />}>
                Share
              </Button>
            )}
          </div>
          <Button onClick={save} loading={saving} disabled={!d.dirty} icon={<Save className="h-4 w-4" />}>
            Save
          </Button>
          <Menu
            items={[
              { label: 'Play', icon: <Play />, onClick: () => leave(`/quizzes/${quiz.id}/play`) },
              { label: 'Present', icon: <Presentation />, onClick: () => leave(`/quizzes/${quiz.id}/present`) },
              { label: 'Share', icon: <Share2 />, onClick: () => setSharing(true), hidden: !isOwner },
              { label: 'Responses', icon: <BarChart3 />, onClick: () => leave(`/quizzes/${quiz.id}/responses`), hidden: !isOwner },
              { label: 'Version log', icon: <History />, onClick: () => leave(`/quizzes/${quiz.id}/versions`) },
              { label: 'Save as new version…', icon: <Save />, onClick: () => setVersionPrompt({ forced: true }) },
            ]}
          />
        </div>
        <div className="mx-auto flex max-w-[1600px] gap-6 px-4 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 py-2.5 text-sm transition-colors',
                tab === t.value
                  ? 'border-brand-700 font-medium text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8">
        {tab === 'questions' && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)_440px]">
            <aside className="min-w-0 lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
              <QuestionList
                questions={draft.questions}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onMove={d.moveQuestion}
                onAdd={() => setAdding(true)}
              />
            </aside>
            <section className="min-w-0">
              {selected ? (
                <>
                  <QuestionEditor
                    key={selected.id}
                    question={selected}
                    index={selectedIndex}
                    settings={draft.settings}
                    onChange={(p) => d.updateQuestion(selected.id, p)}
                    onDuplicate={() => setSelectedId(d.duplicateQuestion(selected).id)}
                    onDelete={() => deleteQuestion(selected.id)}
                  />
                  <div className="mt-4 flex flex-wrap justify-between gap-2">
                    <Button variant="secondary" onClick={() => setPreviewOpen(true)} icon={<Eye className="h-4 w-4" />} className="2xl:hidden">
                      Preview
                    </Button>
                    <Button variant="secondary" onClick={() => setAdding(true)} className="ml-auto" icon={<Plus className="h-4 w-4" />}>
                      Add question
                    </Button>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={IconListAdd}
                  title="Add your first question"
                  description="Mix and match nine question types, including word search and maze puzzles. Add as many as you like; there's no fixed number."
                  action={<Button onClick={() => setAdding(true)}>Add question</Button>}
                />
              )}
            </section>
            <aside className="hidden 2xl:sticky 2xl:top-36 2xl:block 2xl:self-start">
              <LivePreview question={selected} settings={draft.settings} />
            </aside>
          </div>
        )}
        {tab === 'design' && <DesignPanel settings={draft.settings} onChange={d.updateSettings} sampleQuestion={selected ?? draft.questions[0]} />}
        {tab === 'settings' && (
          <SettingsPanel title={draft.title} description={draft.description} settings={draft.settings} onDetails={d.patch} onChange={d.updateSettings} />
        )}
      </main>

      <AddQuestionModal
        open={adding}
        onClose={() => setAdding(false)}
        onPick={(type) => {
          const q = d.addQuestion(type, selectedIndex >= 0 ? selectedIndex + 1 : undefined);
          setSelectedId(q.id);
          setTab('questions');
        }}
      />
      <SaveVersionModal
        open={!!versionPrompt}
        onClose={() => setVersionPrompt(null)}
        currentVersion={quiz.version}
        responses={quiz.responsesOnCurrentVersion}
        forced={!!versionPrompt?.forced}
        onSave={(note) => doSave({ versionNote: note, forceNewVersion: versionPrompt?.forced })}
      />
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview" size="lg">
        <LivePreview question={selected} settings={draft.settings} />
      </Modal>
      {sharing && <ShareModal open onClose={() => setSharing(false)} quizId={quiz.id} />}
      {!isOwner && (
        <div className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg shadow-slate-900/15">
          Editing {quiz.owner.firstName}'s quiz · <Link to="/shared" className="underline">Shared with me</Link>
        </div>
      )}
    </div>
  );
}
