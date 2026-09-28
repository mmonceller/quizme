import { useState, type FormEvent } from 'react';
import { accountApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { useAuth, useUser } from '@/context/AuthContext';
import { useToast } from '@/components/feedback/ToastProvider';
import { Button, Card, Field, Input, Select } from '@/components/ui';
import { AvatarPicker } from '@/components/common/AvatarPicker';
import { GENDER_OPTIONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export function ProfileSection() {
  const user = useUser();
  const { setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    gender: user.gender as string,
  });
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      setUser((await accountApi.update(form)).user);
      toast('Profile updated');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const changeAvatar = async (file: File | null) => {
    if (!file) return;
    setAvatarBusy(true);
    try {
      setUser((await accountApi.setAvatar(file)).user);
      toast('Profile picture updated');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = async () => {
    setUser((await accountApi.removeAvatar()).user);
  };

  return (
    <Card title="Profile" description="How you appear to people you share quizzes with.">
      <div className="mb-6 flex items-center gap-5 border-b border-slate-100 pb-6">
        <AvatarPicker file={null} currentUrl={user.avatarUrl} onChange={changeAvatar} size={72} />
        <div>
          <div className="font-display text-base font-semibold text-slate-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-slate-500">@{user.username} · Joined {formatDate(user.createdAt)}</div>
          <div className="mt-1.5 flex gap-2">
            {avatarBusy && <span className="text-[13px] text-slate-500">Uploading…</span>}
            {user.avatarUrl && !avatarBusy && (
              <button onClick={removeAvatar} className="text-[13px] font-medium text-rose-700 underline-offset-4 hover:underline">
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input value={form.firstName} onChange={set('firstName')} required />
          </Field>
          <Field label="Last name">
            <Input value={form.lastName} onChange={set('lastName')} required />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Username">
            <Input value={form.username} onChange={set('username')} required />
          </Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={set('gender')}>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set('email')} required />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={busy}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
