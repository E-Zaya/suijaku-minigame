import type { BestScore, Difficulty } from '@/components/memory-grid/types';

const storageKey = (d: Difficulty) => `mg_best_${d}`;

/** Read the stored best score for a difficulty, or null if none */
export function getBest(difficulty: Difficulty): BestScore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(difficulty));
    return raw ? (JSON.parse(raw) as BestScore) : null;
  } catch {
    return null;
  }
}

/** Persist a new best score */
export function saveBest(entry: BestScore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(entry.difficulty), JSON.stringify(entry));
  } catch {
    // Storage might be full or disabled; silently ignore
  }
}

/** Returns true when the candidate score exceeds the stored best */
export function isNewBest(score: number, difficulty: Difficulty): boolean {
  const prev = getBest(difficulty);
  return !prev || score > prev.score;
}
