/* ── Shared TypeScript types for Memory Grid ─────────── */

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Language   = 'en' | 'ja';
export type GamePhase  = 'start' | 'playing' | 'cleared';
export type Theme      = 'auto' | 'light' | 'dark';

/** Emoji used as card faces – instantly recognisable animals */
export type IconName =
  | '🦊' | '🐼' | '🦁' | '🐸' | '🐧'
  | '🦉' | '🐙' | '🦋' | '🐢' | '🐝';

export interface CardData {
  /** Index in the shuffled array – used as the stable identity */
  id: number;
  /** Which matched pair this card belongs to (0 … pairs-1) */
  pairId: number;
  iconName: IconName;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface DifficultyConfig {
  rows: number;
  cols: number;
  pairs: number;
}

/** Persisted high-score record */
export interface BestScore {
  score: number;
  timeSeconds: number;
  mistakes: number;
  difficulty: Difficulty;
  /** ISO-8601 date string */
  date: string;
}
