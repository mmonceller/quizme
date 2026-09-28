import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { Button, Field, Input, Modal } from '@/components/ui';

export function SaveVersionModal({
  open,
  onClose,
  currentVersion,
  responses,
  forced,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  currentVersion: number;
  responses: number;
  forced: boolean;
  onSave: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setNote('');
  }, [open]);

  const save = async () => {
    setBusy(true);
    try {
      await onSave(note.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Save as version ${currentVersion + 1}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} icon={<History className="h-4 w-4" />}>
            Save new version
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!forced && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900">
            <strong className="font-semibold">
              {responses} {responses === 1 ? 'person has' : 'people have'} already answered version {currentVersion}.
            </strong>{' '}
            Your question changes will be saved as a new version so their responses stay linked to the exact questions
            they saw.
          </div>
        )}
        <Field label="What changed? (optional)" hint="Shown in the version log.">
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Fixed typo in Q3, added 2 questions" autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} />
        </Field>
      </div>
    </Modal>
  );
}
