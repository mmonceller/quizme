import { Hono } from 'hono';
import type { FolderRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { ownedFolder, ownedGroup } from '../services/access.ts';
import { toFolder } from '../services/serialize.ts';
import { requireString } from '../services/validate.ts';
import { badRequest, jsonBody } from '../utils/http.ts';
import { newId, now } from '../utils/ids.ts';

export const foldersRoutes = new Hono<AppEnv>();

foldersRoutes.get('/', async (c) => {
  const rows = await c.var.db.all<FolderRow>(
    'SELECT * FROM folders WHERE owner_id = ? ORDER BY name COLLATE NOCASE',
    c.var.userId,
  );
  return c.json({ folders: rows.map(toFolder) });
});

foldersRoutes.post('/', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const name = requireString(body.name, 'Folder name', 80);
  const group = await ownedGroup(db, String(body.groupId ?? ''), userId);
  let parentId: string | null = null;
  if (body.parentId) {
    const parent = await ownedFolder(db, String(body.parentId), userId);
    if (parent.group_id !== group.id) throw badRequest('Parent folder belongs to another group');
    parentId = parent.id;
  }
  const id = newId();
  await db.run(
    'INSERT INTO folders (id, owner_id, group_id, parent_id, name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    userId,
    group.id,
    parentId,
    name,
    now(),
  );
  const folder = (await db.get<FolderRow>('SELECT * FROM folders WHERE id = ?', id))!;
  return c.json({ folder: toFolder(folder) }, 201);
});

foldersRoutes.put('/:id', async (c) => {
  const { db, userId } = c.var;
  const folder = await ownedFolder(db, c.req.param('id'), userId);
  const name = requireString((await jsonBody(c)).name, 'Folder name', 80);
  await db.run('UPDATE folders SET name = ? WHERE id = ?', name, folder.id);
  return c.json({ folder: toFolder({ ...folder, name }) });
});

foldersRoutes.delete('/:id', async (c) => {
  const { db, userId } = c.var;
  const folder = await ownedFolder(db, c.req.param('id'), userId);
  await db.run('DELETE FROM folders WHERE id = ?', folder.id);
  return c.json({ ok: true });
});
