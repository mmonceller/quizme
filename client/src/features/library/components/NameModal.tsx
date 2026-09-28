import { useEffect, useState } from 'react';
import { errorMessage } from '@/api/client';
import { Button, Field, Input, Modal } from '@/components/ui';

/** Generic single-text-field dialog (used for creating and renaming folders). */
export function NameModal({
  open,
  onClose,
  title,
  label,
  initial = '',
  confirmLabel = 'Save',
  placeholder,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  label: string;
  initial?: string;
  confirmLabel?: string;
  placeholder?: string;
  onSubmit: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue(initial);
      setError(null);
    }
  }, [open, initial]);

  const submit = async () => {
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(value.trim());
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
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy} disabled={!value.trim()}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Field label={label} error={error}>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Field>
    </Modal>
  );
}
