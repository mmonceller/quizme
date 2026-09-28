import type { Context, MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import type { AppEnv } from '../env.ts';

const COOKIE = 'qg_session';
const SESSION_DAYS = 30;
const SESSION_SECONDS = SESSION_DAYS * 24 * 60 * 60;

/**
 * Starts a session: sets a cookie for same-origin clients and returns the token for clients
 * on another domain (GitHub Pages), which send it back as `Authorization: Bearer <token>`.
 */
export async function startSession(c: Context<AppEnv>, userId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const token = await sign({ sub: userId, exp }, c.env.JWT_SECRET, 'HS256');
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: new URL(c.req.url).protocol === 'https:',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
  return token;
}

function sessionToken(c: Context<AppEnv>): string | undefined {
  const header = c.req.header('Authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7).trim() || undefined;
  return getCookie(c, COOKIE);
}

export function clearSessionCookie(c: Context<AppEnv>) {
  deleteCookie(c, COOKIE, { path: '/' });
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const token = sessionToken(c);
  if (!token) return c.json({ error: 'Please log in' }, 401);
  let userId: string;
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
    userId = String(payload.sub);
    if (!(await c.var.db.get('SELECT id FROM users WHERE id = ?', userId))) throw new Error('user gone');
  } catch {
    clearSessionCookie(c);
    return c.json({ error: 'Your session has expired. Please log in again.' }, 401);
  }
  c.set('userId', userId);
  await next();
};
