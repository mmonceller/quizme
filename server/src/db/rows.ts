export interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  gender: string;
  avatar_url: string | null;
  created_at: string;
}

export interface GroupRow {
  id: string;
  owner_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  quiz_count?: number;
  folder_count?: number;
}

export interface FolderRow {
  id: string;
  owner_id: string;
  group_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface QuizRow {
  id: string;
  owner_id: string;
  group_id: string;
  folder_id: string | null;
  title: string;
  description: string;
  questions: string;
  settings: string;
  version: number;
  public_enabled: number;
  public_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizSummaryRow {
  id: string;
  owner_id: string;
  group_id: string;
  folder_id: string | null;
  title: string;
  description: string;
  version: number;
  public_enabled: number;
  created_at: string;
  updated_at: string;
  question_count: number;
  response_count: number;
  theme_json: string;
  owner_json: string | null;
  permission?: string;
}

export interface VersionRow {
  quiz_id: string;
  version: number;
  snapshot: string;
  note: string;
  changes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface VersionSummaryRow extends VersionRow {
  response_count: number;
  created_by_json: string | null;
}

export interface UploadRow {
  id: string;
  owner_id: string | null;
  content_type: string;
  size: number;
  data: ArrayBuffer;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  quiz_id: string;
  version: number;
  participant_name: string;
  birthday: string;
  answers: string;
  results: string;
  score: number;
  max_score: number;
  duration_seconds: number | null;
  submitted_at: string;
}
