import type { Context, ErrorHandler } from 'hono';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const badRequest = (msg: string) => new HttpError(400, msg);
export const notFound = (msg = 'Not found') => new HttpError(404, msg);
export const forbidden = (msg = 'You do not have access to this') => new HttpError(403, msg);

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status as 400);
  console.error(err);
  return c.json({ error: 'Something went wrong. Please try again.' }, 500);
};

export type Body = Record<string, unknown>;

/** Parses a JSON body, treating a missing or malformed one as empty. */
export async function jsonBody(c: Context): Promise<Body> {
  const body = await c.req.json().catch(() => ({}));
  return body && typeof body === 'object' && !Array.isArray(body) ? (body as Body) : {};
}
