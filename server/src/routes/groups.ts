import { Hono } from 'hono';
import type { FolderRow, GroupRow, QuizSummaryRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { ownedGroup } from '../services/access.ts';
import { QUIZ_SUMMARY_COLUMNS, toFolder, toGroup, toQuizSummary } from '../services/serialize.ts';
import { requireString } from '../services/validate.ts';
import { jsonBody } from '../utils/http.ts';
import { newId, now } from '../utils/ids.ts';
import { DEFAULT_GROUP_ICON, isGroupIconKey } from '../../../shared/groupIcons.ts';

export const groupsRoutes = new Hono<AppEnv>();

function readGroupBody(body: Record<string, unknown>) {
  return {
    name: requireString(body.name, 'Group name', 80),
    icon: isGroupIconKey(body.icon) ? body.icon : DEFAULT_GROUP_ICON,
    color: typeof body.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(body.color) ? body.color : '#3a5196',
  };
}

groupsRoutes.get('/', async (c) => {
  const rows = await c.var.db.all<GroupRow>(
    `SELECT g.*,
       (SELECT COUNT(*) FROM quizzes q WHERE q.group_id = g.id) AS quiz_count,
       (SELECT COUNT(*) FROM folders f WHERE f.group_id = g.id) AS folder_count
     FROM groups g WHERE g.owner_id = ? ORDER BY g.created_at`,
    c.var.userId,
  );
  return c.json({ groups: rows.map(toGroup) });
});

groupsRoutes.post('/', async (c) => {
  const { db, userId } = c.var;
  const body = readGroupBody(await jsonBody(c));
  const id = newId();
  await db.run(
    'INSERT INTO groups (id, owner_id, name, icon, color, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    userId,
    body.name,
    body.icon,
    body.color,
    now(),
  );
  const group = (await db.get<GroupRow>('SELECT * FROM groups WHERE id = ?', id))!;
  return c.json({ group: toGroup(group) }, 201);
});

groupsRoutes.get('/:id', async (c) => {
  const { db, userId } = c.var;
  const group = await ownedGroup(db, c.req.param('id'), userId);
  const [folders, quizzes] = await Promise.all([
    db.all<FolderRow>('SELECT * FROM folders WHERE group_id = ? ORDER BY name COLLATE NOCASE', group.id),
    db.all<QuizSummaryRow>(
      `SELECT ${QUIZ_SUMMARY_COLUMNS} FROM quizzes q WHERE q.group_id = ? ORDER BY q.updated_at DESC`,
      group.id,
    ),
  ]);
  return c.json({
    group: toGroup(group),
    folders: folders.map(toFolder),
    quizzes: quizzes.map((q) => toQuizSummary(q, userId)),
  });
});

groupsRoutes.put('/:id', async (c) => {
  const { db, userId } = c.var;
  const group = await ownedGroup(db, c.req.param('id'), userId);
  const body = readGroupBody(await jsonBody(c));
  await db.run('UPDATE groups SET name = ?, icon = ?, color = ? WHERE id = ?', body.name, body.icon, body.color, group.id);
  return c.json({ group: toGroup((await db.get<GroupRow>('SELECT * FROM groups WHERE id = ?', group.id))!) });
});

groupsRoutes.delete('/:id', async (c) => {
  const { db, userId } = c.var;
  const group = await ownedGroup(db, c.req.param('id'), userId);
  await db.run('DELETE FROM groups WHERE id = ?', group.id);
  return c.json({ ok: true });
});
