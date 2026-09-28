/**
 * Where the API lives. Empty when the site and API share an origin (Cloudflare Workers, local
 * dev); set via VITE_API_BASE for static hosts like GitHub Pages that call the Worker remotely.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

/** Stored image paths ("/uploads/…") are served by the API, so point them at it. */
export function mediaUrl<T extends string | null | undefined>(url: T): T {
  return (url?.startsWith('/uploads/') ? `${API_BASE}${url}` : url) as T;
}

/** Absolute path within the site, including the deploy base (e.g. "/quizme/"). */
export const sitePath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
