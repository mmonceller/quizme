import { Hono } from 'hono';
import type { Gender } from '../../../shared/types.ts';
import type { Db } from '../db/database.ts';
import type { UserRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { clearSessionCookie, requireAuth, startSession } from '../middleware/auth.ts';
import { hashPassword, verifyPassword } from '../services/passwords.ts';
import { toUser } from '../services/serialize.ts';
import { imageField, saveUpload } from '../services/uploads.ts';
import { requireString } from '../services/validate.ts';
import { badRequest, HttpError, jsonBody } from '../utils/http.ts';
import { newId, now } from '../utils/ids.ts';

export const GENDERS: Gender[] = ['male', 'female', 'non_binary', 'prefer_not_to_say', 'other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;

export function validateProfile(body: Record<string, unknown>) {
  const email = requireString(body.email, 'Email', 254).toLowerCase();
  if (!EMAIL_RE.test(email)) throw badRequest('Please enter a valid email address');
  const username = requireString(body.username, 'Username', 30);
  if (!USERNAME_RE.test(username)) {
    throw badRequest('Username must be 3-30 characters: letters, numbers, dots or underscores');
  }
  const firstName = requireString(body.firstName, 'First name', 60);
  const lastName = requireString(body.lastName, 'Last name', 60);
  const gender = body.gender as Gender;
  if (!GENDERS.includes(gender)) throw badRequest('Please select a gender option');
  return { email, username, firstName, lastName, gender };
}

export async function assertUnique(db: Db, email: string, username: string, exceptId = '') {
  if (await db.get('SELECT 1 FROM users WHERE email = ? AND id != ?', email, exceptId)) {
    throw new HttpError(409, 'That email is already registered');
  }
  if (await db.get('SELECT 1 FROM users WHERE username = ? AND id != ?', username, exceptId)) {
    throw new HttpError(409, 'That username is taken');
  }
}

export function validatePassword(password: unknown): string {
  if (typeof password !== 'string' || password.length < 8) {
    throw badRequest('Password must be at least 8 characters');
  }
  if (password.length > 200) throw badRequest('Password must be at most 200 characters');
  return password;
}

export const authRoutes = new Hono<AppEnv>();

authRoutes.post('/register', async (c) => {
  const db = c.var.db;
  const body = await c.req.parseBody();
  const profile = validateProfile(body);
  const password = validatePassword(body.password);
  const avatar = imageField(body.avatar);
  await assertUnique(db, profile.email, profile.username);

  const id = newId();
  await db.run(
    `INSERT INTO users (id, email, username, password_hash, first_name, last_name, gender, avatar_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
    id,
    profile.email,
    profile.username,
    await hashPassword(password),
    profile.firstName,
    profile.lastName,
    profile.gender,
    now(),
  );
  if (avatar) await db.run('UPDATE users SET avatar_url = ? WHERE id = ?', await saveUpload(db, avatar, id), id);

  const token = await startSession(c, id);
  const user = (await db.get<UserRow>('SELECT * FROM users WHERE id = ?', id))!;
  return c.json({ user: toUser(user), token }, 201);
});

authRoutes.post('/login', async (c) => {
  const body = await jsonBody(c);
  const identifier = requireString(body.identifier, 'Email or username', 254);
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';
  const user = await c.var.db.get<UserRow>(
    'SELECT * FROM users WHERE email = ? OR username = ?',
    identifier,
    identifier,
  );
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new HttpError(401, 'Incorrect email/username or password');
  }
  const token = await startSession(c, user.id);
  return c.json({ user: toUser(user), token });
});

authRoutes.post('/logout', (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});

authRoutes.get('/me', requireAuth, async (c) => {
  const user = (await c.var.db.get<UserRow>('SELECT * FROM users WHERE id = ?', c.var.userId))!;
  return c.json({ user: toUser(user) });
});
