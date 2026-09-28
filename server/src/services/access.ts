import type { Permission } from '../../../shared/types.ts';
import type { Db } from '../db/database.ts';
import type { FolderRow, GroupRow, QuizRow } from '../db/rows.ts';
import { badRequest, forbidden, notFound } from '../utils/http.ts';

export async function loadQuiz(db: Db, quizId: string, userId: string, need: Permission = 'view') {
  const quiz = await db.get<QuizRow>('SELECT * FROM quizzes WHERE id = ?', quizId);
  if (!quiz) throw notFound('Quiz not found');

  let permission: Permission;
  if (quiz.owner_id === userId) permission = 'owner';
  else {
    const share = await db.get<{ permission: 'view' | 'edit' }>(
      'SELECT permission FROM quiz_shares WHERE quiz_id = ? AND user_id = ?',
      quizId,
      userId,
    );
    if (!share) throw notFound('Quiz not found');
    permission = share.permission;
  }

  const rank = { view: 0, edit: 1, owner: 2 };
  if (rank[permission] < rank[need]) {
    throw forbidden(need === 'owner' ? 'Only the quiz owner can do this' : 'You only have view access to this quiz');
  }
  return { quiz, permission };
}

export async function ownedGroup(db: Db, groupId: string, userId: string): Promise<GroupRow> {
  const group = await db.get<GroupRow>('SELECT * FROM groups WHERE id = ? AND owner_id = ?', groupId, userId);
  if (!group) throw notFound('Group not found');
  return group;
}

export async function ownedFolder(db: Db, folderId: string, userId: string): Promise<FolderRow> {
  const folder = await db.get<FolderRow>('SELECT * FROM folders WHERE id = ? AND owner_id = ?', folderId, userId);
  if (!folder) throw notFound('Folder not found');
  return folder;
}

/** Validates a (group, folder) destination owned by the user. */
export async function resolveLocation(db: Db, userId: string, groupId: unknown, folderId: unknown) {
  if (typeof groupId !== 'string' || !groupId) throw badRequest('Choose a group');
  await ownedGroup(db, groupId, userId);
  if (folderId === null || folderId === undefined || folderId === '') return { groupId, folderId: null };
  if (typeof folderId !== 'string') throw badRequest('Invalid folder');
  const folder = await ownedFolder(db, folderId, userId);
  if (folder.group_id !== groupId) throw badRequest('That folder is not in the selected group');
  return { groupId, folderId };
}
