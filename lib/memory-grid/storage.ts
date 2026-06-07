import type { Difficulty, ScoreRecord } from '@/components/memory-grid/types';

/** How many entries to keep per difficulty leaderboard */
export const MAX_RECORDS = 5;

const recordsKey = (d: Difficulty) => `mg_records_${d}`;
const NAME_KEY = 'mg_player_name';

/** Sort: highest score first, ties broken by faster time */
function rank(a: ScoreRecord, b: ScoreRecord): number {
  return b.score - a.score || a.timeSeconds - b.timeSeconds;
}

/** Read the leaderboard for a difficulty (sorted, may be empty) */
export function getRecords(difficulty: Difficulty): ScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(recordsKey(difficulty));
    const list = raw ? (JSON.parse(raw) as ScoreRecord[]) : [];
    return Array.isArray(list) ? [...list].sort(rank) : [];
  } catch {
    return [];
  }
}

/**
 * Insert a new record into the leaderboard.
 * Returns the 1-based rank of the entry, or 0 if it didn't make the top list.
 */
export function addRecord(difficulty: Difficulty, entry: ScoreRecord): number {
  if (typeof window === 'undefined') return 0;
  const list = getRecords(difficulty);
  list.push(entry);
  list.sort(rank);
  const trimmed = list.slice(0, MAX_RECORDS);
  try {
    localStorage.setItem(recordsKey(difficulty), JSON.stringify(trimmed));
  } catch {
    // Storage might be full or disabled; silently ignore
  }
  const idx = trimmed.indexOf(entry);
  return idx === -1 ? 0 : idx + 1;
}

/** Top record for a difficulty, or null when none exist */
export function getBest(difficulty: Difficulty): ScoreRecord | null {
  return getRecords(difficulty)[0] ?? null;
}

/** Last-used player name */
export function getPlayerName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Persist the player name for next time */
export function savePlayerName(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore
  }
}
