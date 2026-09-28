import { Hono } from 'hono';
import { defaultSettings } from '../../../shared/defaults.ts';
import type { QuizSnapshot } from '../../../shared/types.ts';
import type { Db } from '../db/database.ts';
import type { QuizRow, QuizSummaryRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { loadQuiz, resolveLocation } from '../services/access.ts';
import { QUIZ_SUMMARY_COLUMNS, toQuiz, toQuizSummary } from '../services/serialize.ts';
import { optionalString, requireString, validateQuestions, validateSettings } from '../services/validate.ts';
import { insertVersionStmt, saveQuizContent } from '../services/versioning.ts';
import { jsonBody } from '../utils/http.ts';
import { newId, now } from '../utils/ids.ts';

export const quizzesRoutes = new Hono<AppEnv>();

async function createQuiz(
  db: Db,
  userId: string,
  location: { groupId: string; folderId: string | null },
  snapshot: QuizSnapshot,
): Promise<string> {
  const id = newId();
  const ts = now();
  await db.batch([
    db.stmt(
      `INSERT INTO quizzes (id, owner_id, group_id, folder_id, title, description, questions, settings, version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      id,
      userId,
      location.groupId,
      location.folderId,
      snapshot.title,
      snapshot.description,
      JSON.stringify(snapshot.questions),
      JSON.stringify(snapshot.settings),
      ts,
      ts,
    ),
    insertVersionStmt(db, id, 1, snapshot, userId, 'Created', null),
  ]);
  return id;
}

const quizById = async (db: Db, id: string) => (await db.get<QuizRow>('SELECT * FROM quizzes WHERE id = ?', id))!;

quizzesRoutes.get('/recent', async (c) => {
  const { db, userId } = c.var;
  const rows = await db.all<QuizSummaryRow>(
    `SELECT ${QUIZ_SUMMARY_COLUMNS} FROM quizzes q WHERE q.owner_id = ? ORDER BY q.updated_at DESC LIMIT 8`,
    userId,
  );
  return c.json({ quizzes: rows.map((r) => toQuizSummary(r, userId)) });
});

quizzesRoutes.get('/shared', async (c) => {
  const { db, userId } = c.var;
  const rows = await db.all<QuizSummaryRow>(
    `SELECT ${QUIZ_SUMMARY_COLUMNS}, s.permission AS permission
     FROM quiz_shares s JOIN quizzes q ON q.id = s.quiz_id
     WHERE s.user_id = ? ORDER BY s.created_at DESC`,
    userId,
  );
  return c.json({ quizzes: rows.map((r) => toQuizSummary(r, userId)) });
});

quizzesRoutes.post('/', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const location = await resolveLocation(db, userId, body.groupId, body.folderId);
  const id = await createQuiz(db, userId, location, {
    title: requireString(body.title, 'Quiz name', 150),
    description: optionalString(body.description, 2000),
    questions: [],
    settings: defaultSettings(),
  });
  return c.json({ quiz: await toQuiz(db, await quizById(db, id), 'owner') }, 201);
});

quizzesRoutes.get('/:id', async (c) => {
  const { db, userId } = c.var;
  const { quiz, permission } = await loadQuiz(db, c.req.param('id'), userId);
  return c.json({ quiz: await toQuiz(db, quiz, permission) });
});

quizzesRoutes.put('/:id', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const { quiz, permission } = await loadQuiz(db, c.req.param('id'), userId, 'edit');
  const result = await saveQuizContent(
    db,
    quiz,
    {
      title: requireString(body.title, 'Quiz name', 150),
      description: optionalString(body.description, 2000),
      questions: validateQuestions(body.questions),
      settings: validateSettings(body.settings),
      note: optionalString(body.versionNote, 300).trim(),
      forceNewVersion: body.forceNewVersion === true,
    },
    userId,
  );
  return c.json({ quiz: await toQuiz(db, await quizById(db, quiz.id), permission), ...result });
});

quizzesRoutes.delete('/:id', async (c) => {
  const { db, userId } = c.var;
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  await db.run('DELETE FROM quizzes WHERE id = ?', quiz.id);
  return c.json({ ok: true });
});

quizzesRoutes.post('/:id/move', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId, 'owner');
  const location = await resolveLocation(db, userId, body.groupId, body.folderId);
  await db.run(
    'UPDATE quizzes SET group_id = ?, folder_id = ?, updated_at = ? WHERE id = ?',
    location.groupId,
    location.folderId,
    now(),
    quiz.id,
  );
  return c.json({ ok: true });
});

quizzesRoutes.post('/:id/duplicate', async (c) => {
  const { db, userId } = c.var;
  const body = await jsonBody(c);
  const { quiz } = await loadQuiz(db, c.req.param('id'), userId);
  const location = await resolveLocation(db, userId, body.groupId, body.folderId);
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : `${quiz.title} (copy)`;
  const id = await createQuiz(db, userId, location, {
    title: title.slice(0, 150),
    description: quiz.description,
    questions: JSON.parse(quiz.questions),
    settings: JSON.parse(quiz.settings),
  });
  return c.json({ quiz: await toQuiz(db, await quizById(db, id), 'owner') }, 201);
});
