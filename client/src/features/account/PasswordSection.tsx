import { useState, type FormEvent } from 'react';
import { accountApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { useToast } from '@/components/feedback/ToastProvider';
import { Button, Card, Field, Input } from '@/components/ui';

export function PasswordSection() {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast('New passwords do not match', 'error');
      return;
    }
    setBusy(true);
    try {
      await accountApi.changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      toast('Password changed');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Password" description="Use at least 8 characters. You'll stay signed in on this device.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password">
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="New password" hint="At least 8 characters">
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" required minLength={8} />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" loading={busy}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}
