/** True when a #rrggbb color is light enough to need dark text on top of it. */
export function isLight(color: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(color);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
}
