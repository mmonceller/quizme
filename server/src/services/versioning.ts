import type { Question, QuizSettings, QuizSnapshot, VersionChanges } from '../../../shared/types.ts';
import type { Db } from '../db/database.ts';
import type { QuizRow } from '../db/rows.ts';
import { now } from '../utils/ids.ts';

export function diffQuestions(before: Question[], after: Question[]): VersionChanges {
  const beforeMap = new Map(before.map((q) => [q.id, JSON.stringify(q)]));
  const afterIds = new Set(after.map((q) => q.id));
  let added = 0;
  let modified = 0;
  for (const q of after) {
    const prev = beforeMap.get(q.id);
    if (prev === undefined) added++;
    else if (prev !== JSON.stringify(q)) modified++;
  }
  const removed = before.filter((q) => !afterIds.has(q.id)).length;
  const orderChanged =
    added === 0 && removed === 0 && before.map((q) => q.id).join() !== after.map((q) => q.id).join();
  return { added, removed, modified: modified + (orderChanged && modified === 0 ? 1 : 0) };
}

export function hasChanges(c: VersionChanges) {
  return c.added + c.removed + c.modified > 0;
}

export function insertVersionStmt(
  db: Db,
  quizId: string,
  version: number,
  snapshot: QuizSnapshot,
  userId: string,
  note: string,
  changes: VersionChanges | null,
) {
  return db.stmt(
    `INSERT INTO quiz_versions (quiz_id, version, snapshot, note, changes, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    quizId,
    version,
    JSON.stringify(snapshot),
    note,
    changes ? JSON.stringify(changes) : null,
    userId,
    now(),
  );
}

interface SaveInput {
  title: string;
  description: string;
  questions: Question[];
  settings: QuizSettings;
  note: string;
  forceNewVersion: boolean;
}

/**
 * Saves quiz content. A new version is created when the questions change on a version
 * that already has responses (or when explicitly requested), so earlier responses keep
 * pointing at the exact questions they answered. Otherwise the current version's
 * snapshot is updated in place.
 */
export async function saveQuizContent(db: Db, quiz: QuizRow, input: SaveInput, userId: string) {
  const before = JSON.parse(quiz.questions) as Question[];
  const changes = diffQuestions(before, input.questions);
  const responses =
    (
      await db.get<{ n: number }>(
        'SELECT COUNT(*) AS n FROM responses WHERE quiz_id = ? AND version = ?',
        quiz.id,
        quiz.version,
      )
    )?.n ?? 0;

  const bump = input.forceNewVersion || (responses > 0 && hasChanges(changes));
  const version = bump ? quiz.version + 1 : quiz.version;
  const snapshot: QuizSnapshot = {
    title: input.title,
    description: input.description,
    questions: input.questions,
    settings: input.settings,
  };

  const updateQuiz = db.stmt(
    `UPDATE quizzes SET title = ?, description = ?, questions = ?, settings = ?, version = ?, updated_at = ?
     WHERE id = ?`,
    input.title,
    input.description,
    JSON.stringify(input.questions),
    JSON.stringify(input.settings),
    version,
    now(),
    quiz.id,
  );

  const note = input.note || (responses > 0 ? `Edited after ${responses} response(s) on v${quiz.version}` : '');
  const versionStmt = bump
    ? insertVersionStmt(db, quiz.id, version, snapshot, userId, note, changes)
    : db.stmt(
        'UPDATE quiz_versions SET snapshot = ? WHERE quiz_id = ? AND version = ?',
        JSON.stringify(snapshot),
        quiz.id,
        version,
      );

  await db.batch([updateQuiz, versionStmt]);
  return { versionCreated: bump, version };
}
