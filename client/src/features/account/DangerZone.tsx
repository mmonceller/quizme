import { useState } from 'react';
import { useNavigate } from 'react-router';
import { accountApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { sessionToken } from '@/api/session';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Field, Input, Modal } from '@/components/ui';

export function DangerZone() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      await accountApi.remove(password);
      sessionToken.clear();
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Card title="Delete account" className="border-rose-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-sm leading-relaxed text-slate-600">
          Permanently delete your account and all of your groups, folders, quizzes, and responses. This cannot be undone.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your account?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={remove} loading={busy} disabled={!password}>
              Delete forever
            </Button>
          </>
        }
      >
        <Field label="Enter your password to confirm" error={error}>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        </Field>
      </Modal>
    </Card>
  );
}
