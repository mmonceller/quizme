import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { quizApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { Button, Field, Input, Modal, Textarea } from '@/components/ui';

export function CreateQuizModal({
  open,
  onClose,
  groupId,
  folderId,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  folderId: string | null;
}) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setError(null);
    }
  }, [open]);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const { quiz } = await quizApi.create(groupId, folderId, title.trim(), description.trim());
      navigate(`/quizzes/${quiz.id}/edit`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New quiz"
      description="You can add as many questions as you like after this."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={create} loading={busy} disabled={!title.trim()}>
            Create & start editing
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Quiz name" error={error}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. The Solar System" autoFocus />
        </Field>
        <Field label="Description (optional)">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this quiz about?"
          />
        </Field>
      </div>
    </Modal>
  );
}
