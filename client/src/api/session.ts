/**
 * The session token, sent as a bearer header. Cookies can't be used when the site and API are
 * on different domains (GitHub Pages → workers.dev) because browsers block third-party cookies.
 */
const KEY = 'qg_session';

export const sessionToken = {
  get: () => localStorage.getItem(KEY),
  set: (token: string | undefined) => token && localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};
