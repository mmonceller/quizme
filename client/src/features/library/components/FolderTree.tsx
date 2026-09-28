import { useState } from 'react';
import { ChevronRight, Folder as FolderIcon, FolderOpen } from 'lucide-react';
import type { Folder } from '@shared/types';
import { cn } from '@/lib/utils';

interface Props {
  folders: Folder[];
  selectedId: string | null;
  onSelect: (folderId: string | null) => void;
  rootLabel: React.ReactNode;
  disabledIds?: Set<string>;
}

/** Collapsible tree of nested folders for a single group; `null` represents the group root. */
export function FolderTree({ folders, selectedId, onSelect, rootLabel, disabledIds }: Props) {
  const byParent = new Map<string | null, Folder[]>();
  for (const f of folders) {
    const list = byParent.get(f.parentId) ?? [];
    list.push(f);
    byParent.set(f.parentId, list);
  }

  const ancestors = new Set<string>();
  let cur = folders.find((f) => f.id === selectedId);
  while (cur?.parentId) {
    ancestors.add(cur.parentId);
    cur = folders.find((f) => f.id === cur!.parentId);
  }

  return (
    <div className="space-y-0.5">
      <Row depth={0} active={selectedId === null} onClick={() => onSelect(null)} label={rootLabel} />
      <Branch
        parentId={null}
        depth={1}
        byParent={byParent}
        selectedId={selectedId}
        onSelect={onSelect}
        initiallyOpen={ancestors}
        disabledIds={disabledIds}
      />
    </div>
  );
}

function Branch({
  parentId,
  depth,
  byParent,
  selectedId,
  onSelect,
  initiallyOpen,
  disabledIds,
}: {
  parentId: string | null;
  depth: number;
  byParent: Map<string | null, Folder[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  initiallyOpen: Set<string>;
  disabledIds?: Set<string>;
}) {
  return (
    <>
      {(byParent.get(parentId) ?? []).map((f) => (
        <Node
          key={f.id}
          folder={f}
          depth={depth}
          byParent={byParent}
          selectedId={selectedId}
          onSelect={onSelect}
          initiallyOpen={initiallyOpen}
          disabledIds={disabledIds}
        />
      ))}
    </>
  );
}

function Node(props: {
  folder: Folder;
  depth: number;
  byParent: Map<string | null, Folder[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  initiallyOpen: Set<string>;
  disabledIds?: Set<string>;
}) {
  const { folder, depth, byParent, selectedId, onSelect, initiallyOpen, disabledIds } = props;
  const children = byParent.get(folder.id) ?? [];
  const [open, setOpen] = useState(initiallyOpen.has(folder.id));
  const active = selectedId === folder.id;
  return (
    <>
      <Row
        depth={depth}
        active={active}
        disabled={disabledIds?.has(folder.id)}
        onClick={() => onSelect(folder.id)}
        label={
          <>
            {active || open ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <FolderIcon className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">{folder.name}</span>
          </>
        }
        toggle={
          children.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((o) => !o);
              }}
              className="rounded p-0.5 hover:bg-black/5"
              aria-label={open ? 'Collapse' : 'Expand'}
            >
              <ChevronRight className={cn('h-4 w-4 transition-transform', open && 'rotate-90')} />
            </button>
          ) : (
            <span className="w-5" />
          )
        }
      />
      {open && (
        <Branch
          parentId={folder.id}
          depth={depth + 1}
          byParent={byParent}
          selectedId={selectedId}
          onSelect={onSelect}
          initiallyOpen={initiallyOpen}
          disabledIds={disabledIds}
        />
      )}
    </>
  );
}

function Row({
  depth,
  active,
  onClick,
  label,
  toggle,
  disabled,
}: {
  depth: number;
  active: boolean;
  onClick: () => void;
  label: React.ReactNode;
  toggle?: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && onClick()}
      style={{ paddingLeft: 8 + depth * 16 }}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm transition-colors',
        active ? 'bg-slate-200/70 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {toggle}
      {label}
    </div>
  );
}
