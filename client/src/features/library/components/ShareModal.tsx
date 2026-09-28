import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Check, Copy, Globe, RefreshCw, Search, UserPlus, X } from 'lucide-react';
import type { PublicUser, QuizShare } from '@shared/types';
import { accountApi, quizApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { sitePath } from '@/api/config';
import { useToast } from '@/components/feedback/ToastProvider';
import { Avatar, Button, Input, Modal, Select, Spinner, Toggle } from '@/components/ui';
import { fullName } from '@/lib/utils';

export function ShareModal({ open, onClose, quizId }: { open: boolean; onClose: () => void; quizId: string }) {
  const toast = useToast();
  const [shares, setShares] = useState<QuizShare[] | null>(null);
  const [pub, setPub] = useState<{ enabled: boolean; token: string | null }>({ enabled: false, token: null });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShares(null);
    setQuery('');
    Promise.all([quizApi.shares(quizId), quizApi.get(quizId)])
      .then(([s, q]) => {
        setShares(s.shares);
        setPub({ enabled: q.quiz.publicEnabled, token: q.quiz.publicToken });
      })
      .catch((err) => toast(errorMessage(err), 'error'));
  }, [open, quizId, toast]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      accountApi
        .searchUsers(query.trim())
        .then((r) => setResults(r.users))
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const add = async (user: PublicUser) => {
    try {
      setShares((await quizApi.share(quizId, user.id, permission)).shares);
      setQuery('');
      toast(`Shared with ${fullName(user)}`);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const update = async (userId: string, p: 'view' | 'edit') => {
    setShares((await quizApi.share(quizId, userId, p)).shares);
  };

  const remove = async (userId: string) => {
    setShares((await quizApi.unshare(quizId, userId)).shares);
  };

  const togglePublic = async (enabled: boolean) => {
    try {
      const r = await quizApi.setPublic(quizId, enabled);
      setPub({ enabled: r.publicEnabled, token: r.publicToken });
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  };

  const regenerate = async () => {
    const r = await quizApi.regenerateLink(quizId);
    setPub({ enabled: r.publicEnabled, token: r.publicToken });
    toast('New link created. The old link no longer works.', 'info');
  };

  const link = pub.token ? `${window.location.origin}${sitePath(`p/${pub.token}`)}` : '';
  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sharedIds = new Set(shares?.map((s) => s.user.id));

  return (
    <Modal open={open} onClose={onClose} title="Share quiz" size="lg">
      {!shares ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <UserPlus className="h-4 w-4 text-slate-500" /> People
            </h3>
            <p className="mb-3 mt-1 text-sm text-slate-500">
              They will find it under “Shared with me”. Editors can change questions; viewers can play and present.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, username, or exact email"
                  className="pl-9"
                />
              </div>
              <Select value={permission} onChange={(e) => setPermission(e.target.value as 'view' | 'edit')} className="w-32">
                <option value="view">Can view</option>
                <option value="edit">Can edit</option>
              </Select>
            </div>
            {results.length > 0 && (
              <div className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
                {results.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => add(u)}
                    disabled={sharedIds.has(u.id)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Avatar user={u} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">{fullName(u)}</div>
                      <div className="truncate text-xs text-slate-500">@{u.username}</div>
                    </div>
                    <span className="text-[13px] font-medium text-brand-700">
                      {sharedIds.has(u.id) ? 'Added' : 'Add'}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {shares.length > 0 && (
              <ul className="mt-4 divide-y divide-slate-100">
                {shares.map((s) => (
                  <li key={s.user.id} className="flex items-center gap-3 py-2.5">
                    <Avatar user={s.user} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900">{fullName(s.user)}</div>
                      <div className="truncate text-xs text-slate-500">@{s.user.username}</div>
                    </div>
                    <Select
                      value={s.permission}
                      onChange={(e) => update(s.user.id, e.target.value as 'view' | 'edit')}
                      className="h-9 w-28 text-sm"
                    >
                      <option value="view">Can view</option>
                      <option value="edit">Can edit</option>
                    </Select>
                    <button
                      onClick={() => remove(s.user.id)}
                      className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border-t border-slate-200 pt-6">
            <Toggle
              checked={pub.enabled}
              onChange={togglePublic}
              label={
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" /> Public participant link
                </span>
              }
              description="Anyone with the link can take the quiz. They'll be asked for their full name and birthday, and their answers and score will appear in Responses."
            />
            {pub.enabled && link && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <Input value={link} readOnly onFocus={(e) => e.target.select()} className="bg-slate-50 font-mono text-[13px]" />
                  <Button onClick={copy} icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={regenerate} icon={<RefreshCw className="h-4 w-4" />}>
                    New link
                  </Button>
                  <Link to={`/quizzes/${quizId}/responses`} onClick={onClose}>
                    <Button variant="secondary" size="sm">
                      View responses
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
