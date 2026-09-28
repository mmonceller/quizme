import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@shared/types';
import { UNAUTHORIZED_EVENT } from '@/api/client';
import { authApi } from '@/api/endpoints';
import { sessionToken } from '@/api/session';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (form: FormData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await authApi.login(identifier, password);
    sessionToken.set(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (form: FormData) => {
    const res = await authApi.register(form);
    sessionToken.set(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    sessionToken.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** For pages rendered behind ProtectedRoute, where a user is guaranteed. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useUser requires an authenticated user');
  return user;
}
