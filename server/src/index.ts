import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { Db } from './db/database.ts';
import type { AppEnv } from './env.ts';
import { requireAuth } from './middleware/auth.ts';
import { authRoutes } from './routes/auth.ts';
import { accountRoutes, usersRoutes } from './routes/account.ts';
import { groupsRoutes } from './routes/groups.ts';
import { foldersRoutes } from './routes/folders.ts';
import { quizzesRoutes } from './routes/quizzes.ts';
import { quizSharingRoutes } from './routes/quizSharing.ts';
import { quizResultsRoutes } from './routes/quizResults.ts';
import { publicRoutes } from './routes/public.ts';
import { filesRoutes, uploadsRoutes } from './routes/uploads.ts';
import { errorHandler } from './utils/http.ts';

/**
 * Handles /api/* and /uploads/*. Every other path is served straight from the static
 * assets (see wrangler.jsonc), which doesn't invoke the Worker or count against its limits.
 */
const app = new Hono<AppEnv>();

app.use('*', async (c, next) => {
  c.set('db', new Db(c.env.DB));
  await next();
});

app.use('/api/*', (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean);
  return cors({
    origin: (origin) => (allowed.includes(origin) ? origin : null),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86400,
  })(c, next);
});

app.use(
  '/api/*',
  bodyLimit({ maxSize: 5 * 1024 * 1024, onError: (c) => c.json({ error: 'Request is too large' }, 413) }),
);

for (const prefix of ['/api/account', '/api/users', '/api/groups', '/api/folders', '/api/quizzes', '/api/uploads']) {
  app.use(prefix, requireAuth);
  app.use(`${prefix}/*`, requireAuth);
}

app.route('/api/auth', authRoutes);
app.route('/api/public', publicRoutes);
app.route('/api/account', accountRoutes);
app.route('/api/users', usersRoutes);
app.route('/api/groups', groupsRoutes);
app.route('/api/folders', foldersRoutes);
app.route('/api/quizzes', quizzesRoutes);
app.route('/api/quizzes', quizSharingRoutes);
app.route('/api/quizzes', quizResultsRoutes);
app.route('/api/uploads', uploadsRoutes);
app.route('/uploads', filesRoutes);

app.all('/api/*', (c) => c.json({ error: 'Not found' }, 404));
app.notFound((c) => c.env.ASSETS.fetch(c.req.raw));
app.onError(errorHandler);

export default app;
