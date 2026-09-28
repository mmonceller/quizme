import type {
  AnswerMap,
  Folder,
  GradeResult,
  Group,
  PublicQuiz,
  PublicUser,
  Question,
  Quiz,
  QuizSettings,
  QuizShare,
  QuizSummary,
  QuizVersion,
  QuizVersionSummary,
  ResponseDetail,
  ResponseSummary,
  User,
} from '@shared/types';
import { prepareUpload } from '@/lib/compressImage';
import { http } from './client';

export const AVATAR_SIZE = 512;

export interface ProfileInput {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export const authApi = {
  me: () => http.get<{ user: User }>('/auth/me'),
  login: (identifier: string, password: string) =>
    http.post<{ user: User; token: string }>('/auth/login', { identifier, password }),
  register: (form: FormData) => http.post<{ user: User; token: string }>('/auth/register', form),
  logout: () => http.post('/auth/logout'),
};

export const accountApi = {
  update: (input: ProfileInput) => http.put<{ user: User }>('/account', input),
  setAvatar: async (file: File) => {
    const fd = new FormData();
    fd.append('avatar', await prepareUpload(file, AVATAR_SIZE));
    return http.put<{ user: User }>('/account/avatar', fd);
  },
  removeAvatar: () => http.del<{ user: User }>('/account/avatar'),
  changePassword: (currentPassword: string, newPassword: string) =>
    http.put('/account/password', { currentPassword, newPassword }),
  remove: (password: string) => http.del('/account', { password }),
  searchUsers: (q: string) => http.get<{ users: PublicUser[] }>(`/users/search?q=${encodeURIComponent(q)}`),
};

export const uploadApi = {
  image: async (file: File) => {
    const fd = new FormData();
    fd.append('file', await prepareUpload(file));
    return (await http.post<{ url: string }>('/uploads', fd)).url;
  },
};

export interface GroupInput {
  name: string;
  icon: string;
  color: string;
}

export const libraryApi = {
  groups: () => http.get<{ groups: Group[] }>('/groups'),
  group: (id: string) => http.get<{ group: Group; folders: Folder[]; quizzes: QuizSummary[] }>(`/groups/${id}`),
  createGroup: (input: GroupInput) => http.post<{ group: Group }>('/groups', input),
  updateGroup: (id: string, input: GroupInput) => http.put<{ group: Group }>(`/groups/${id}`, input),
  deleteGroup: (id: string) => http.del(`/groups/${id}`),
  folders: () => http.get<{ folders: Folder[] }>('/folders'),
  createFolder: (groupId: string, parentId: string | null, name: string) =>
    http.post<{ folder: Folder }>('/folders', { groupId, parentId, name }),
  renameFolder: (id: string, name: string) => http.put<{ folder: Folder }>(`/folders/${id}`, { name }),
  deleteFolder: (id: string) => http.del(`/folders/${id}`),
};

export interface SaveQuizInput {
  title: string;
  description: string;
  questions: Question[];
  settings: QuizSettings;
  versionNote?: string;
  forceNewVersion?: boolean;
}

export const quizApi = {
  recent: () => http.get<{ quizzes: QuizSummary[] }>('/quizzes/recent'),
  shared: () => http.get<{ quizzes: QuizSummary[] }>('/quizzes/shared'),
  get: (id: string) => http.get<{ quiz: Quiz }>(`/quizzes/${id}`),
  create: (groupId: string, folderId: string | null, title: string, description: string) =>
    http.post<{ quiz: Quiz }>('/quizzes', { groupId, folderId, title, description }),
  save: (id: string, input: SaveQuizInput) =>
    http.put<{ quiz: Quiz; versionCreated: boolean; version: number }>(`/quizzes/${id}`, input),
  remove: (id: string) => http.del(`/quizzes/${id}`),
  move: (id: string, groupId: string, folderId: string | null) =>
    http.post(`/quizzes/${id}/move`, { groupId, folderId }),
  duplicate: (id: string, groupId: string, folderId: string | null) =>
    http.post<{ quiz: Quiz }>(`/quizzes/${id}/duplicate`, { groupId, folderId }),

  shares: (id: string) => http.get<{ shares: QuizShare[] }>(`/quizzes/${id}/shares`),
  share: (id: string, userId: string, permission: 'view' | 'edit') =>
    http.post<{ shares: QuizShare[] }>(`/quizzes/${id}/shares`, { userId, permission }),
  unshare: (id: string, userId: string) => http.del<{ shares: QuizShare[] }>(`/quizzes/${id}/shares/${userId}`),
  setPublic: (id: string, enabled: boolean) =>
    http.put<{ publicEnabled: boolean; publicToken: string }>(`/quizzes/${id}/public`, { enabled }),
  regenerateLink: (id: string) =>
    http.post<{ publicEnabled: boolean; publicToken: string }>(`/quizzes/${id}/public/regenerate`),

  versions: (id: string) => http.get<{ versions: QuizVersionSummary[] }>(`/quizzes/${id}/versions`),
  version: (id: string, v: number) => http.get<{ version: QuizVersion }>(`/quizzes/${id}/versions/${v}`),
  responses: (id: string) => http.get<{ responses: ResponseSummary[] }>(`/quizzes/${id}/responses`),
  response: (id: string, rid: string) => http.get<{ response: ResponseDetail }>(`/quizzes/${id}/responses/${rid}`),
  deleteResponse: (id: string, rid: string) => http.del(`/quizzes/${id}/responses/${rid}`),
};

export const publicApi = {
  get: (token: string) => http.get<{ quiz: PublicQuiz }>(`/public/${token}`),
  check: (token: string, version: number, questionId: string, answer: unknown) =>
    http.post<{ result: GradeResult; question: Question }>(`/public/${token}/check`, { version, questionId, answer }),
  submit: (
    token: string,
    body: { version: number; participantName: string; birthday: string; answers: AnswerMap; durationSeconds: number },
  ) =>
    http.post<{ score: number; maxScore: number; results: Record<string, GradeResult> }>(`/public/${token}/submit`, body),
};
