export const newId = () => crypto.randomUUID();
export const now = () => new Date().toISOString();

export function base64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const newToken = () => base64url(crypto.getRandomValues(new Uint8Array(9)));
