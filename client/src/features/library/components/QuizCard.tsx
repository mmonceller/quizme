import { Link, useNavigate } from 'react-router';
import {
  BarChart3,
  Copy,
  FolderInput,
  Globe,
  History,
  LogOut,
  Pencil,
  Play,
  Presentation,
  Share2,
  Trash2,
} from 'lucide-react';
import type { QuizSummary } from '@shared/types';
import { Avatar, Menu, type MenuItem } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { ThemeThumb } from './ThemeThumb';

export type QuizAction = 'share' | 'move' | 'duplicate' | 'delete' | 'leave';

export function QuizCard({ quiz, onAction }: { quiz: QuizSummary; onAction: (action: QuizAction, quiz: QuizSummary) => void }) {
  const navigate = useNavigate();
  const isOwner = !quiz.permission;
  const canEdit = isOwner || quiz.permission === 'edit';
  const href = canEdit ? `/quizzes/${quiz.id}/edit` : `/quizzes/${quiz.id}/play`;

  const go = (path: string) => () => navigate(`/quizzes/${quiz.id}/${path}`);
  const items: MenuItem[] = [
    { label: 'Edit', icon: <Pencil />, onClick: go('edit'), hidden: !canEdit },
    { label: 'Play', icon: <Play />, onClick: go('play') },
    { label: 'Present', icon: <Presentation />, onClick: go('present') },
    { label: 'Share', icon: <Share2 />, onClick: () => onAction('share', quiz), hidden: !isOwner },
    { label: 'Responses', icon: <BarChart3 />, onClick: go('responses'), hidden: !isOwner },
    { label: 'Version log', icon: <History />, onClick: go('versions') },
    { label: 'Move', icon: <FolderInput />, onClick: () => onAction('move', quiz), hidden: !isOwner },
    { label: isOwner ? 'Duplicate' : 'Copy to my library', icon: <Copy />, onClick: () => onAction('duplicate', quiz) },
    { label: 'Delete', icon: <Trash2 />, onClick: () => onAction('delete', quiz), danger: true, hidden: !isOwner },
    { label: 'Remove from shared', icon: <LogOut />, onClick: () => onAction('leave', quiz), danger: true, hidden: isOwner },
  ];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-300">
      <Link to={href} className="block border-b border-slate-200">
        <ThemeThumb theme={quiz.theme} className="h-24" />
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-3.5 pt-3.5">
        <div className="flex items-start gap-2">
          <Link to={href} className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-brand-700">
              {quiz.title}
            </h3>
            {quiz.description && <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-slate-500">{quiz.description}</p>}
          </Link>
          <Menu items={items} className="-mr-1.5 -mt-1" />
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-4 text-xs text-slate-500">
          <span>
            {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
          </span>
          <span className="text-slate-300">·</span>
          <span>v{quiz.version}</span>
          {isOwner && quiz.responseCount > 0 && (
            <>
              <span className="text-slate-300">·</span>
              <span>
                {quiz.responseCount} {quiz.responseCount === 1 ? 'response' : 'responses'}
              </span>
            </>
          )}
        </div>
        <div className="mt-3 flex min-h-5 items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          {quiz.owner ? (
            <>
              <Avatar user={quiz.owner} size={20} />
              <span className="truncate">
                {quiz.owner.firstName} {quiz.owner.lastName}
              </span>
              <span className="shrink-0 rounded border border-slate-200 px-1.5 py-px text-[11px] font-medium">
                {quiz.permission === 'edit' ? 'Can edit' : 'View only'}
              </span>
            </>
          ) : (
            quiz.publicEnabled && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                <Globe className="h-3.5 w-3.5" /> Public link on
              </span>
            )
          )}
          <span className="ml-auto shrink-0">{timeAgo(quiz.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
