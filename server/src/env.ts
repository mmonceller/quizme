import type { Db } from './db/database.ts';

export interface Bindings {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET: string;
  /** Comma-separated origins allowed to call the API from another domain (e.g. GitHub Pages). */
  ALLOWED_ORIGINS?: string;
}

export interface Variables {
  db: Db;
  userId: string;
}

export type AppEnv = { Bindings: Bindings; Variables: Variables };
