export function hashCode(t: string) {
  var hash = 0, i, chr;
  if (t.length === 0) return hash;
  for (i = 0; i < t.length; i++) {
    chr = t.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};