import { Hono } from 'hono';
import type { UploadRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { imageField, saveUpload } from '../services/uploads.ts';
import { badRequest } from '../utils/http.ts';

export const uploadsRoutes = new Hono<AppEnv>();

uploadsRoutes.post('/', async (c) => {
  const file = imageField((await c.req.parseBody()).file);
  if (!file) throw badRequest('Please choose an image');
  return c.json({ url: await saveUpload(c.var.db, file, c.var.userId) }, 201);
});

/** Serves stored images at /uploads/:id. Ids are random, so responses are cacheable forever. */
export const filesRoutes = new Hono<AppEnv>();

filesRoutes.get('/:id', async (c) => {
  const row = await c.var.db.get<UploadRow>('SELECT content_type, data FROM uploads WHERE id = ?', c.req.param('id'));
  if (!row) return c.text('Not found', 404);
  return c.body(new Uint8Array(row.data), 200, {
    'Content-Type': row.content_type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    // SVGs can carry scripts; this stops them running when an image URL is opened directly.
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  });
});
