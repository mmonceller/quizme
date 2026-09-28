import { Link } from 'react-router';
import type { Group } from '@shared/types';
import { GroupIcon } from '@/components/icons';
import { GroupBadge } from './GroupBadge';

export function GroupCard({ group }: { group: Group }) {
  const quizzes = group.quizCount ?? 0;
  const folders = group.folderCount ?? 0;
  return (
    <Link
      to={`/groups/${group.id}`}
      className="group flex min-h-[132px] flex-col rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
    >
      <GroupBadge color={group.color}>
        <GroupIcon icon={group.icon} className="h-5 w-5" />
      </GroupBadge>
      <h3 className="mt-auto truncate pt-5 font-display text-[15px] font-semibold text-slate-900 group-hover:text-brand-700">
        {group.name}
      </h3>
      <p className="mt-0.5 text-[13px] text-slate-500">
        {quizzes} {quizzes === 1 ? 'quiz' : 'quizzes'} · {folders} {folders === 1 ? 'folder' : 'folders'}
      </p>
    </Link>
  );
}
