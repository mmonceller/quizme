import { withDefaultSettings } from '../../../shared/defaults.ts';
import type {
  Folder,
  Group,
  Gender,
  Permission,
  PublicUser,
  Question,
  Quiz,
  QuizSummary,
  QuizVersionSummary,
  ResponseSummary,
  User,
} from '../../../shared/types.ts';
import type { Db } from '../db/database.ts';
import type {
  FolderRow,
  GroupRow,
  QuizRow,
  QuizSummaryRow,
  ResponseRow,
  UserRow,
  VersionSummaryRow,
} from '../db/rows.ts';

export function toUser(r: UserRow): User {
  return {
    id: r.id,
    email: r.email,
    username: r.username,
    firstName: r.first_name,
    lastName: r.last_name,
    gender: r.gender as Gender,
    avatarUrl: r.avatar_url,
    createdAt: r.created_at,
  };
}

export function toPublicUser(r: Pick<UserRow, 'id' | 'username' | 'first_name' | 'last_name' | 'avatar_url'>): PublicUser {
  return {
    id: r.id,
    username: r.username,
    firstName: r.first_name,
    lastName: r.last_name,
    avatarUrl: r.avatar_url,
  };
}

export async function publicUserById(db: Db, id: string | null): Promise<PublicUser | null> {
  if (!id) return null;
  const row = await db.get<UserRow>('SELECT * FROM users WHERE id = ?', id);
  return row ? toPublicUser(row) : null;
}

export function toGroup(r: GroupRow): Group {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    createdAt: r.created_at,
    quizCount: r.quiz_count,
    folderCount: r.folder_count,
  };
}

export function toFolder(r: FolderRow): Folder {
  return { id: r.id, groupId: r.group_id, parentId: r.parent_id, name: r.name, createdAt: r.created_at };
}

/**
 * A subquery returning the user's public fields as JSON, so list queries don't need a
 * follow-up lookup per row (D1 on the free plan allows 50 queries per request).
 */
export const publicUserJson = (idColumn: string) =>
  `(SELECT json_object('id', u.id, 'username', u.username, 'first_name', u.first_name,
     'last_name', u.last_name, 'avatar_url', u.avatar_url) FROM users u WHERE u.id = ${idColumn})`;

function parsePublicUser(json: string | null | undefined): PublicUser | null {
  return json ? toPublicUser(JSON.parse(json)) : null;
}

export const QUIZ_SUMMARY_COLUMNS = `
  q.id, q.owner_id, q.group_id, q.folder_id, q.title, q.description, q.version, q.public_enabled,
  q.created_at, q.updated_at,
  json_array_length(q.questions) AS question_count,
  (SELECT COUNT(*) FROM responses r WHERE r.quiz_id = q.id) AS response_count,
  json_extract(q.settings, '$.theme') AS theme_json,
  ${publicUserJson('q.owner_id')} AS owner_json`;

export function toQuizSummary(r: QuizSummaryRow, viewerId: string): QuizSummary {
  const summary: QuizSummary = {
    id: r.id,
    groupId: r.owner_id === viewerId ? r.group_id : null,
    folderId: r.owner_id === viewerId ? r.folder_id : null,
    title: r.title,
    description: r.description,
    questionCount: r.question_count,
    version: r.version,
    responseCount: r.response_count,
    publicEnabled: !!r.public_enabled,
    theme: withDefaultSettings({ theme: JSON.parse(r.theme_json || '{}') }).theme,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
  if (r.owner_id !== viewerId) {
    summary.owner = parsePublicUser(r.owner_json) ?? undefined;
    summary.permission = (r.permission as Permission) ?? 'view';
  }
  return summary;
}

export async function toQuiz(db: Db, r: QuizRow, permission: Permission): Promise<Quiz> {
  const [counts, owner] = await Promise.all([
    db.get<{ total: number; current: number }>(
      `SELECT COUNT(*) AS total, COALESCE(SUM(version = ?), 0) AS current FROM responses WHERE quiz_id = ?`,
      r.version,
      r.id,
    ),
    publicUserById(db, r.owner_id),
  ]);
  const isOwner = permission === 'owner';
  return {
    id: r.id,
    groupId: isOwner ? r.group_id : null,
    folderId: isOwner ? r.folder_id : null,
    title: r.title,
    description: r.description,
    questions: JSON.parse(r.questions) as Question[],
    settings: withDefaultSettings(JSON.parse(r.settings)),
    version: r.version,
    publicEnabled: !!r.public_enabled,
    publicToken: isOwner ? r.public_token : null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    owner: owner!,
    permission,
    responsesOnCurrentVersion: counts?.current ?? 0,
    totalResponses: counts?.total ?? 0,
  };
}

/** Columns for `FROM quiz_versions v`, shaped for {@link toVersionSummary}. */
export const VERSION_COLUMNS = `v.*,
  (SELECT COUNT(*) FROM responses r WHERE r.quiz_id = v.quiz_id AND r.version = v.version) AS response_count,
  ${publicUserJson('v.created_by')} AS created_by_json`;

export function toVersionSummary(r: VersionSummaryRow): QuizVersionSummary {
  const snapshot = JSON.parse(r.snapshot);
  return {
    version: r.version,
    note: r.note,
    changes: r.changes ? JSON.parse(r.changes) : null,
    questionCount: snapshot.questions?.length ?? 0,
    responseCount: r.response_count,
    createdAt: r.created_at,
    createdBy: parsePublicUser(r.created_by_json),
  };
}

export function toResponseSummary(r: ResponseRow): ResponseSummary {
  return {
    id: r.id,
    version: r.version,
    participantName: r.participant_name,
    birthday: r.birthday,
    score: r.score,
    maxScore: r.max_score,
    durationSeconds: r.duration_seconds,
    submittedAt: r.submitted_at,
  };
}
