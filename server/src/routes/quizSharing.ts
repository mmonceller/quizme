import { Hono } from 'hono';
import type { Db } from '../db/database.ts';
import type { UserRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { loadQuiz } from '../services/access.ts';
import { toPublicUser } from '../services/serialize.ts';
import { badRequest, jsonBody, notFound } from '../utils/http.ts';
import { newToken, now } from '../utils/ids.ts';

export const quizSharingRoutes = new Hono<AppEnv>();

interface ShareRow extends UserRow {
  permission: 'view' | 'edit';
  shared_at: string;
}

async function listShares(db: Db, quizId: string) {
  const rows = await db.all<ShareRow>(
    `SELECT u.*, s.permission, s.created_at AS shared_at
     FROM quiz_shares s JOIN users u ON u.id = s.user_id
     WHERE s.quiz_id = ? ORDER BY s.created_at`,
    quizId,
  );
  return rows.map((r) => ({ user: toPublicUser(r), permission: r.permission, createdAt: r.shared_at }));
}

quizSharingRoutes.get('/:id/shares', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  return c.json({ shares: await listShares(db, quiz.id) });
});

quizSharingRoutes.post('/:id/shares', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  const permission = body.permission === 'edit' ? 'edit' : 'view';
  const target = await db.get<UserRow>('SELECT * FROM users WHERE id = ?', String(body.userId ?? ''));
  if (!target) throw notFound('User not found');
  if (target.id === userId) throw badRequest('You already own this quiz');
  await db.run(
    `INSERT INTO quiz_shares (quiz_id, user_id, permission, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT (quiz_id, user_id) DO UPDATE SET permission = excluded.permission`,
    quiz.id,
    target.id,
    permission,
    now(),
  );
  return c.json({ shares: await listShares(db, quiz.id) });
});

quizSharingRoutes.delete('/:id/shares/:userId', async (c) => {
  const { db, userId } = c.var;
  const targetId = c.req.param('userId');
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId);
  // Owners can remove anyone; collaborators can remove themselves ("leave").
  if (quiz.owner_id !== userId && targetId !== userId) await loadQuiz(db, quiz.id, userId, 'owner');
  await db.run('DELETE FROM quiz_shares WHERE quiz_id = ? AND user_id = ?', quiz.id, targetId);
  return c.json({ shares: quiz.owner_id === userId ? await listShares(db, quiz.id) : [] });
});

quizSharingRoutes.put('/:id/public', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  const enabled = body.enabled === true;
  const token = quiz.public_token ?? newToken();
  await db.run('UPDATE quizzes SET public_enabled = ?, public_token = ? WHERE id = ?', enabled ? 1 : 0, token, quiz.id);
  return c.json({ publicEnabled: enabled, publicToken: token });
});

quizSharingRoutes.post('/:id/public/regenerate', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  const token = newToken();
  await db.run('UPDATE quizzes SET public_token = ? WHERE id = ?', token, quiz.id);
  return c.json({ publicEnabled: !!quiz.public_enabled, publicToken: token });
});
