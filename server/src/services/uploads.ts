import type { Db } from '../db/database.ts';
import { badRequest } from '../utils/http.ts';
import { newId, now } from '../utils/ids.ts';

const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']);

/** D1 caps a single value at 2 MB; the client compresses photos well below this before upload. */
export const MAX_UPLOAD_BYTES = 1_900_000;

const PREFIX = '/uploads/';

/** Returns the uploaded file from a multipart field, or null when none was sent. */
export function imageField(value: unknown): File | null {
  if (!(value instanceof File) || value.size === 0) return null;
  if (!ALLOWED.has(value.type)) throw badRequest('Only image files (PNG, JPG, GIF, WEBP, SVG) are allowed');
  if (value.size > MAX_UPLOAD_BYTES) throw badRequest('Image is too large (max 1.9 MB)');
  return value;
}

export async function saveUpload(db: Db, file: File, ownerId: string | null): Promise<string> {
  const id = newId();
  await db.run(
    'INSERT INTO uploads (id, owner_id, content_type, size, data, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    ownerId,
    file.type,
    file.size,
    await file.arrayBuffer(),
    now(),
  );
  return `${PREFIX}${id}`;
}

export async function removeUpload(db: Db, url: string | null | undefined) {
  if (!url?.startsWith(PREFIX)) return;
  await db.run('DELETE FROM uploads WHERE id = ?', url.slice(PREFIX.length));
}
