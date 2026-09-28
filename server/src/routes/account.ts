import { Hono } from 'hono';
import type { Db } from '../db/database.ts';
import type { UserRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { clearSessionCookie } from '../middleware/auth.ts';
import { hashPassword, verifyPassword } from '../services/passwords.ts';
import { toPublicUser, toUser } from '../services/serialize.ts';
import { imageField, removeUpload, saveUpload } from '../services/uploads.ts';
import { assertUnique, validatePassword, validateProfile } from './auth.ts';
import { badRequest, HttpError, jsonBody } from '../utils/http.ts';

export const accountRoutes = new Hono<AppEnv>();

const currentUser = async (db: Db, id: string) => (await db.get<UserRow>('SELECT * FROM users WHERE id = ?', id))!;

accountRoutes.put('/', async (c) => {
  const { db, userId } = c.var;
  const profile = validateProfile(await jsonBody(c));
  await assertUnique(db, profile.email, profile.username, userId);
  await db.run(
    'UPDATE users SET email = ?, username = ?, first_name = ?, last_name = ?, gender = ? WHERE id = ?',
    profile.email,
    profile.username,
    profile.firstName,
    profile.lastName,
    profile.gender,
    userId,
  );
  return c.json({ user: toUser(await currentUser(db, userId)) });
});

accountRoutes.put('/avatar', async (c) => {
  const { db, userId } = c.var;
  const file = imageField((await c.req.parseBody()).avatar);
  if (!file) throw badRequest('Please choose an image');
  const previous = (await currentUser(db, userId)).avatar_url;
  await db.run('UPDATE users SET avatar_url = ? WHERE id = ?', await saveUpload(db, file, userId), userId);
  await removeUpload(db, previous);
  return c.json({ user: toUser(await currentUser(db, userId)) });
});

accountRoutes.delete('/avatar', async (c) => {
  const { db, userId } = c.var;
  await removeUpload(db, (await currentUser(db, userId)).avatar_url);
  await db.run('UPDATE users SET avatar_url = NULL WHERE id = ?', userId);
  return c.json({ user: toUser(await currentUser(db, userId)) });
});

accountRoutes.put('/password', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const user = await currentUser(db, userId);
  if (!(await verifyPassword(String(body.currentPassword ?? ''), user.password_hash))) {
    throw new HttpError(401, 'Your current password is incorrect');
  }
  const next = validatePassword(body.newPassword);
  await db.run('UPDATE users SET password_hash = ? WHERE id = ?', await hashPassword(next), userId);
  return c.json({ ok: true });
});

accountRoutes.delete('/', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const user = await currentUser(db, userId);
  if (!(await verifyPassword(String(body.password ?? ''), user.password_hash))) {
    throw new HttpError(401, 'Password is incorrect');
  }
  await removeUpload(db, user.avatar_url);
  await db.run('DELETE FROM users WHERE id = ?', userId);
  clearSessionCookie(c);
  return c.json({ ok: true });
});

export const usersRoutes = new Hono<AppEnv>();

usersRoutes.get('/search', async (c) => {
  const q = (c.req.query('q') ?? '').trim();
  if (q.length < 2) return c.json({ users: [] });
  const like = `%${q.replace(/[%_]/g, '')}%`;
  const rows = await c.var.db.all<UserRow>(
    `SELECT * FROM users
     WHERE id != ? AND (username LIKE ? OR email LIKE ? OR (first_name || ' ' || last_name) LIKE ?)
     ORDER BY username LIMIT 8`,
    c.var.userId,
    like,
    q,
    like,
  );
  return c.json({ users: rows.map(toPublicUser) });
});
