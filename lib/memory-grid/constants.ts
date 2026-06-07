import type { Difficulty, DifficultyConfig, IconName, Language } from '@/components/memory-grid/types';

/* ── Difficulty presets ──────────────────────────────── */
export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy:   { rows: 3, cols: 4, pairs: 6  },
  normal: { rows: 4, cols: 4, pairs: 8  },
  hard:   { rows: 4, cols: 5, pairs: 10 },
};

/** All 10 card faces – Easy uses first 6, Normal 8, Hard all 10 */
export const CARD_ICONS: IconName[] = [
  '🦊', '🐼', '🦁', '🐸', '🐧',
  '🦉', '🐙', '🦋', '🐢', '🐝',
];

/** Accessible names for each emoji face (used in aria-labels) */
export const ICON_LABELS: Record<IconName, string> = {
  '🦊': 'Fox',     '🐼': 'Panda',   '🦁': 'Lion',
  '🐸': 'Frog',    '🐧': 'Penguin', '🦉': 'Owl',
  '🐙': 'Octopus', '🦋': 'Butterfly','🐢': 'Turtle',
  '🐝': 'Bee',
};

/* ── i18n strings ────────────────────────────────────── */
type TKey =
  | 'title' | 'subtitle' | 'start' | 'restart'
  | 'score' | 'time' | 'mistakes' | 'best'
  | 'share' | 'copied' | 'cleared' | 'newBest'
  | 'difficulty' | 'easy' | 'normal' | 'hard'
  | 'easyDesc' | 'normalDesc' | 'hardDesc'
  | 'name' | 'namePlaceholder' | 'records' | 'noRecords' | 'anonymous';

export const T: Record<Language, Record<TKey, string>> = {
  en: {
    title:       'Memory Grid',
    subtitle:    'Memorize the cards and find all matching pairs.',
    start:       'Start',
    restart:     'Restart',
    score:       'Score',
    time:        'Time',
    mistakes:    'Mistakes',
    best:        'Best',
    share:       'Share result',
    copied:      'Copied!',
    cleared:     'Cleared!',
    newBest:     'New Best!',
    difficulty:  'Difficulty',
    easy:        'Easy',
    normal:      'Normal',
    hard:        'Hard',
    easyDesc:    '3×4 · 6 pairs',
    normalDesc:  '4×4 · 8 pairs',
    hardDesc:    '4×5 · 10 pairs',
    name:            'Name',
    namePlaceholder: 'Enter your name',
    records:         'Records',
    noRecords:       'No records yet — be the first!',
    anonymous:       'Anonymous',
  },
  ja: {
    title:       'Memory Grid',
    subtitle:    'カードの位置を覚えて、同じペアを見つけよう。',
    start:       'スタート',
    restart:     'もう一度',
    score:       'スコア',
    time:        '時間',
    mistakes:    'ミス',
    best:        'ベスト',
    share:       '結果をシェア',
    copied:      'コピーしました',
    cleared:     'クリア！',
    newBest:     'New Best!',
    difficulty:  '難易度',
    easy:        'Easy',
    normal:      'Normal',
    hard:        'Hard',
    easyDesc:    '3×4 · 6ペア',
    normalDesc:  '4×4 · 8ペア',
    hardDesc:    '4×5 · 10ペア',
    name:            'なまえ',
    namePlaceholder: '名前を入力',
    records:         'ランキング',
    noRecords:       'まだ記録がありません。最初の一人に！',
    anonymous:       'ななし',
  },
};
