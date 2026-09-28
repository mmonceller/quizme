import { Hono } from 'hono';
import { withDefaultSettings } from '../../../shared/defaults.ts';
import { gradeQuestion, gradeQuiz } from '../../../shared/grading.ts';
import { shouldReveal } from '../../../shared/rules.ts';
import type { Answer, AnswerMap, PublicQuiz, QuizSnapshot } from '../../../shared/types.ts';
import type { Db } from '../db/database.ts';
import type { QuizRow, UserRow, VersionRow } from '../db/rows.ts';
import type { AppEnv } from '../env.ts';
import { stripAnswers } from '../services/sanitize.ts';
import { requireString } from '../services/validate.ts';
import { badRequest, forbidden, jsonBody, notFound } from '../utils/http.ts';
import { newId, now } from '../utils/ids.ts';

export const publicRoutes = new Hono<AppEnv>();

async function loadPublicQuiz(db: Db, token: string) {
  const quiz = await db.get<QuizRow>('SELECT * FROM quizzes WHERE public_token = ? AND public_enabled = 1', token);
  if (!quiz) throw notFound('This quiz link is not available. Ask the quiz owner for a new link.');
  return quiz;
}

async function loadSnapshot(db: Db, quiz: QuizRow, version: unknown): Promise<{ version: number; snapshot: QuizSnapshot }> {
  const v = Number(version ?? quiz.version);
  const row = await db.get<VersionRow>('SELECT * FROM quiz_versions WHERE quiz_id = ? AND version = ?', quiz.id, v);
  if (!row) throw badRequest('This quiz was updated. Please reload the page.');
  const snapshot = JSON.parse(row.snapshot) as QuizSnapshot;
  return { version: v, snapshot: { ...snapshot, settings: withDefaultSettings(snapshot.settings) } };
}

publicRoutes.get('/:token', async (c) => {
  const db = c.var.db;
  const quiz = await loadPublicQuiz(db, c.req.param('token'));
  const [{ version, snapshot }, owner] = await Promise.all([
    loadSnapshot(db, quiz, quiz.version),
    db.get<UserRow>('SELECT * FROM users WHERE id = ?', quiz.owner_id),
  ]);
  const payload: PublicQuiz = {
    title: snapshot.title,
    description: snapshot.description,
    version,
    questions: snapshot.questions.map(stripAnswers),
    settings: { ...snapshot.settings, interactive: true },
    ownerName: owner ? `${owner.first_name} ${owner.last_name}` : '',
  };
  return c.json({ quiz: payload });
});

publicRoutes.post('/:token/check', async (c) => {
  const db = c.var.db;
  const body = await jsonBody(c);
  const quiz = await loadPublicQuiz(db, c.req.param('token'));
  const { snapshot } = await loadSnapshot(db, quiz, body.version);
  const question = snapshot.questions.find((q) => q.id === body.questionId);
  if (!question) throw notFound('Question not found');
  if (!shouldReveal(question, snapshot.settings)) throw forbidden('Answers are hidden for this question');
  return c.json({ result: gradeQuestion(question, (body.answer ?? null) as Answer), question });
});

publicRoutes.post('/:token/submit', async (c) => {
  const db = c.var.db;
  const body = await jsonBody(c);
  const quiz = await loadPublicQuiz(db, c.req.param('token'));
  const { version, snapshot } = await loadSnapshot(db, quiz, body.version);
  const participantName = requireString(body.participantName, 'Full name', 120);
  const birthday = String(body.birthday ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday) || Number.isNaN(Date.parse(birthday))) {
    throw badRequest('Please enter a valid birthday');
  }
  const answers: AnswerMap =
    body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers) ? (body.answers as AnswerMap) : {};
  const { results, score, maxScore } = gradeQuiz(snapshot.questions, answers);
  const duration = Number(body.durationSeconds);

  await db.run(
    `INSERT INTO responses (id, quiz_id, version, participant_name, birthday, answers, results, score, max_score, duration_seconds, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    newId(),
    quiz.id,
    version,
    participantName,
    birthday,
    JSON.stringify(answers),
    JSON.stringify(results),
    score,
    maxScore,
    Number.isFinite(duration) && duration >= 0 ? Math.round(duration) : null,
    now(),
  );
  return c.json({ score, maxScore, results }, 201);
});
