import { useEffect, useState } from 'react';
import type { Group } from '@shared/types';
import { libraryApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { Button, Field, Input, Modal } from '@/components/ui';
import { GROUP_ICON_KEYS, DEFAULT_GROUP_ICON, resolveGroupIcon, type GroupIconKey } from '@shared/groupIcons';
import { GroupIcon, GROUP_ICON_LABELS } from '@/components/icons';
import { GROUP_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { GroupBadge } from './GroupBadge';

export function GroupFormModal({
  open,
  onClose,
  group,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  group?: Group | null;
  onSaved: (group: Group) => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<GroupIconKey>(DEFAULT_GROUP_ICON);
  const [color, setColor] = useState(GROUP_COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(group?.name ?? '');
    setIcon(group ? resolveGroupIcon(group.icon) : DEFAULT_GROUP_ICON);
    setColor(group?.color ?? GROUP_COLORS[0]);
    setError(null);
  }, [open, group]);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const input = { name, icon, color };
      const res = group ? await libraryApi.updateGroup(group.id, input) : await libraryApi.createGroup(input);
      onSaved(res.group);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={group ? 'Edit group' : 'New group'}
      description="Groups hold your folders and quizzes — like a subject or a class."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!name.trim()}>
            {group ? 'Save' : 'Create group'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-end gap-4">
          <GroupBadge color={color} size="lg">
            <GroupIcon icon={icon} className="h-7 w-7" />
          </GroupBadge>
          <Field label="Group name" className="flex-1" error={error}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Grade 5 Science"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && save()}
            />
          </Field>
        </div>
        <div>
          <div className="mb-2 text-[13px] font-medium text-slate-700">Icon</div>
          <div className="grid grid-cols-7 gap-1">
            {GROUP_ICON_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                title={GROUP_ICON_LABELS[key]}
                aria-label={GROUP_ICON_LABELS[key]}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-lg border transition-colors',
                  icon === key
                    ? 'border-brand-600 bg-brand-50 text-brand-700'
                    : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                )}
              >
                <GroupIcon icon={key} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-[13px] font-medium text-slate-700">Color</div>
          <div className="flex flex-wrap gap-2.5">
            {GROUP_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ background: c, ['--tw-ring-color' as string]: c }}
                className={cn('h-7 w-7 rounded-full transition', color === c && 'ring-2 ring-offset-2')}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
