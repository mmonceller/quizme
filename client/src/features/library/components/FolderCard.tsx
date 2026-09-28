import { Pencil, Trash2 } from 'lucide-react';
import type { Folder } from '@shared/types';
import { Menu } from '@/components/ui';
import { GroupIcon } from '@/components/icons';

export function FolderCard({
  folder,
  count,
  color,
  onOpen,
  onRename,
  onDelete,
}: {
  folder: Folder;
  count: number;
  color: string;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white py-2.5 pl-3.5 pr-2 transition-colors hover:border-slate-300"
    >
      <span style={{ color }}>
        <GroupIcon icon="folder" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900">{folder.name}</div>
        <div className="text-xs text-slate-500">
          {count} {count === 1 ? 'item' : 'items'}
        </div>
      </div>
      <Menu
        items={[
          { label: 'Rename', icon: <Pencil />, onClick: onRename },
          { label: 'Delete', icon: <Trash2 />, onClick: onDelete, danger: true },
        ]}
      />
    </div>
  );
}
