import { Hono } from 'hono';
import type { ResponseRow, VersionRow, VersionSummaryRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { loadQuiz } from '../services/access.ts';
import { toResponseSummary, toVersionSummary, VERSION_COLUMNS } from '../services/serialize.ts';
import { withDefaultSettings } from '../../../shared/defaults.ts';
import type { QuizSnapshot } from '../../../shared/types.ts';
import { notFound } from '../utils/http.ts';

export const quizResultsRoutes = new Hono<AppEnv>();

function parseSnapshot(raw: string): QuizSnapshot {
  const s = JSON.parse(raw) as QuizSnapshot;
  return { ...s, settings: withDefaultSettings(s.settings) };
}

quizResultsRoutes.get('/:id/versions', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId);
  const rows = await db.all<VersionSummaryRow>(
    `SELECT ${VERSION_COLUMNS} FROM quiz_versions v WHERE v.quiz_id = ? ORDER BY v.version DESC`,
    quiz.id,
  );
  return c.json({ versions: rows.map(toVersionSummary) });
});

quizResultsRoutes.get('/:id/versions/:version', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId);
  const row = await db.get<VersionSummaryRow>(
    `SELECT ${VERSION_COLUMNS} FROM quiz_versions v WHERE v.quiz_id = ? AND v.version = ?`,
    quiz.id,
    Number(c.req.param('version')),
  );
  if (!row) throw notFound('Version not found');
  return c.json({ version: { ...toVersionSummary(row), snapshot: parseSnapshot(row.snapshot) } });
});

quizResultsRoutes.get('/:id/responses', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  const rows = await db.all<ResponseRow>('SELECT * FROM responses WHERE quiz_id = ? ORDER BY submitted_at DESC', quiz.id);
  return c.json({ responses: rows.map(toResponseSummary) });
});

quizResultsRoutes.get('/:id/responses/:responseId', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  const row = await db.get<ResponseRow>(
    'SELECT * FROM responses WHERE id = ? AND quiz_id = ?',
    c.req.param('responseId'),
    quiz.id,
  );
  if (!row) throw notFound('Response not found');
  const version = await db.get<VersionRow>(
    'SELECT * FROM quiz_versions WHERE quiz_id = ? AND version = ?',
    quiz.id,
    row.version,
  );
  if (!version) throw notFound('The version this response was recorded on is missing');
  return c.json({
    response: {
      ...toResponseSummary(row),
      answers: JSON.parse(row.answers),
      results: JSON.parse(row.results),
      snapshot: parseSnapshot(version.snapshot),
    },
  });
});

quizResultsRoutes.delete('/:id/responses/:responseId', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  await db.run('DELETE FROM responses WHERE id = ? AND quiz_id = ?', c.req.param('responseId'), quiz.id);
  return c.json({ ok: true });
});
