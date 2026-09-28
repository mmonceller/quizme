import { useState } from 'react';
import type { QuizSummary } from '@shared/types';
import { quizApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { useToast } from '@/components/feedback/ToastProvider';
import { useConfirm } from '@/components/feedback/ConfirmProvider';
import { useUser } from '@/context/AuthContext';
import { QuizCard, type QuizAction } from './QuizCard';
import { LocationPickerModal } from './LocationPickerModal';
import { ShareModal } from './ShareModal';

/** Grid of quiz cards plus the dialogs for their menu actions. */
export function QuizGrid({ quizzes, onChanged }: { quizzes: QuizSummary[]; onChanged: () => void }) {
  const toast = useToast();
  const confirm = useConfirm();
  const user = useUser();
  const [active, setActive] = useState<{ action: QuizAction; quiz: QuizSummary } | null>(null);

  const handle = async (action: QuizAction, quiz: QuizSummary) => {
    if (action === 'delete') {
      const ok = await confirm({
        title: `Delete “${quiz.title}”?`,
        message: 'The quiz, its version log, and all responses will be permanently deleted.',
        confirmLabel: 'Delete',
        danger: true,
      });
      if (!ok) return;
      try {
        await quizApi.remove(quiz.id);
        toast('Quiz deleted');
        onChanged();
      } catch (err) {
        toast(errorMessage(err), 'error');
      }
      return;
    }
    if (action === 'leave') {
      if (!(await confirm({ title: 'Remove from your shared list?', confirmLabel: 'Remove', danger: true }))) return;
      await quizApi.unshare(quiz.id, user.id);
      onChanged();
      return;
    }
    setActive({ action, quiz });
  };

  const close = () => setActive(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((q) => (
          <QuizCard key={q.id} quiz={q} onAction={handle} />
        ))}
      </div>

      <LocationPickerModal
        open={active?.action === 'move'}
        onClose={close}
        title={`Move “${active?.quiz.title ?? ''}”`}
        confirmLabel="Move here"
        initial={{ groupId: active?.quiz.groupId ?? undefined, folderId: active?.quiz.folderId }}
        onConfirm={async ({ groupId, folderId }) => {
          await quizApi.move(active!.quiz.id, groupId, folderId);
          toast('Quiz moved');
          onChanged();
        }}
      />
      <LocationPickerModal
        open={active?.action === 'duplicate'}
        onClose={close}
        title={`Duplicate “${active?.quiz.title ?? ''}”`}
        confirmLabel="Duplicate here"
        initial={{ groupId: active?.quiz.groupId ?? undefined, folderId: active?.quiz.folderId }}
        onConfirm={async ({ groupId, folderId }) => {
          await quizApi.duplicate(active!.quiz.id, groupId, folderId);
          toast('Quiz duplicated');
          onChanged();
        }}
      />
      {active?.action === 'share' && <ShareModal open onClose={close} quizId={active.quiz.id} />}
    </>
  );
}
