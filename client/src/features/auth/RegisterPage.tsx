import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/api/client';
import { AVATAR_SIZE } from '@/api/endpoints';
import { prepareUpload } from '@/lib/compressImage';
import { Button, Field, Input, Select } from '@/components/ui';
import { AvatarPicker } from '@/components/common/AvatarPicker';
import { GENDER_OPTIONS } from '@/lib/constants';
import { AuthLayout } from './AuthLayout';

export function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    gender: '',
    password: '',
    confirm: '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => k !== 'confirm' && fd.append(k, v));
      if (avatar) fd.append('avatar', await prepareUpload(avatar, AVATAR_SIZE));
      await register(fd);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="It only takes a minute.">
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-4 pb-2">
          <AvatarPicker file={avatar} onChange={setAvatar} size={64} />
          <div className="text-sm text-slate-500">
            <div className="font-medium text-slate-800">Profile picture</div>
            Optional. Click the circle to upload a photo.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <Input value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required />
          </Field>
          <Field label="Last name">
            <Input value={form.lastName} onChange={set('lastName')} autoComplete="family-name" required />
          </Field>
        </div>
        <Field label="Username" hint="Letters, numbers, dots and underscores. Others can find you by this.">
          <Input value={form.username} onChange={set('username')} autoComplete="username" required minLength={3} />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </Field>
        <Field label="Gender">
          <Select value={form.gender} onChange={set('gender')} required>
            <option value="" disabled>
              Select…
            </option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Password" hint="At least 8 characters">
            <Input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required minLength={8} />
          </Field>
          <Field label="Confirm password">
            <Input type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
          </Field>
        </div>
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-800">{error}</div>}
        <Button type="submit" size="lg" className="!mt-6 w-full" loading={busy}>
          Create account
        </Button>
      </form>
      <p className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-700 underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
