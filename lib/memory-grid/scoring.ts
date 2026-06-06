/**
 * Score formula: 10000 − time×20 − mistakes×150, minimum 0.
 * Time is measured in seconds from first card flip to last match.
 */
export function calcScore(timeSeconds: number, mistakes: number): number {
  return Math.max(0, 10000 - timeSeconds * 20 - mistakes * 150);
}

/** Pad a number to always show three digits, like classic arcade scores */
export function pad3(n: number): string {
  return String(Math.min(n, 999)).padStart(3, '0');
}

/** Format elapsed seconds as M:SS when ≥60s, otherwise just the number */
export function formatTime(seconds: number): string {
  if (seconds < 60) return String(seconds);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
