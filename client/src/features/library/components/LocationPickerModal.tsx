import { useEffect, useState } from 'react';
import type { Folder, Group } from '@shared/types';
import { libraryApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { Button, Modal, Spinner } from '@/components/ui';
import { GroupIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { FolderTree } from './FolderTree';

export interface Location {
  groupId: string;
  folderId: string | null;
}

/** Lets the user pick a destination group/folder, e.g. for moving or duplicating a quiz. */
export function LocationPickerModal({
  open,
  onClose,
  title,
  confirmLabel,
  initial,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  confirmLabel: string;
  initial?: Partial<Location>;
  onConfirm: (location: Location) => Promise<void>;
}) {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setGroups(null);
    Promise.all([libraryApi.groups(), libraryApi.folders()])
      .then(([g, f]) => {
        setGroups(g.groups);
        setFolders(f.folders);
        setGroupId(initial?.groupId ?? g.groups[0]?.id ?? null);
        setFolderId(initial?.folderId ?? null);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [open, initial?.groupId, initial?.folderId]);

  const confirm = async () => {
    if (!groupId) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm({ groupId, folderId });
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const group = groups?.find((g) => g.id === groupId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm} loading={busy} disabled={!groupId}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {!groups ? (
        error ? (
          <p className="text-rose-600">{error}</p>
        ) : (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )
      ) : groups.length === 0 ? (
        <p className="text-slate-500">Create a group in your library first.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Group</div>
            <div className="flex gap-1 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setGroupId(g.id);
                    setFolderId(null);
                  }}
                  className={cn(
                    'flex shrink-0 items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm transition-colors',
                    g.id === groupId
                      ? 'border-brand-600 bg-brand-50 font-medium text-brand-800'
                      : 'border-transparent text-slate-700 hover:bg-slate-100',
                  )}
                >
                  <GroupIcon icon={g.icon} className="h-4 w-4 shrink-0" style={{ color: g.color }} />
                  <span className="truncate">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Folder</div>
            <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 p-1.5">
              {group && (
                <FolderTree
                  folders={folders.filter((f) => f.groupId === group.id)}
                  selectedId={folderId}
                  onSelect={setFolderId}
                  rootLabel={
                    <span className="flex min-w-0 items-center gap-2">
                      <GroupIcon icon={group.icon} className="h-4 w-4 shrink-0" style={{ color: group.color }} />
                      <span className="truncate">{group.name}</span>
                      <span className="text-slate-400">(top level)</span>
                    </span>
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
      {groups && error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </Modal>
  );
}
