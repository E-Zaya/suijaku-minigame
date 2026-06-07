'use client';

import { Crown } from 'lucide-react';
import { T } from '@/lib/memory-grid/constants';
import { getRecords } from '@/lib/memory-grid/storage';
import type { Difficulty, Language } from './types';

interface LeaderboardProps {
  difficulty: Difficulty;
  lang: Language;
  /** 1-based rank to highlight (e.g. the score just achieved) */
  highlightRank?: number;
}

/** Medal colour for the top three ranks */
const MEDAL: Record<number, string> = {
  1: '#D9A441', // gold
  2: '#A8A8A8', // silver
  3: '#B5793F', // bronze
};

export default function Leaderboard({ difficulty, lang, highlightRank }: LeaderboardProps) {
  const t = T[lang];
  const records = getRecords(difficulty);

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center gap-1.5 mb-2 px-1">
        <Crown size={13} style={{ color: 'var(--mg-text-muted)' }} />
        <span
          className="text-[11px] uppercase tracking-widest font-medium"
          style={{ color: 'var(--mg-text-muted)' }}
        >
          {t.records}
        </span>
      </div>

      {records.length === 0 ? (
        <p
          className="text-xs px-1 py-3 text-center"
          style={{ color: 'var(--mg-text-muted)' }}
        >
          {t.noRecords}
        </p>
      ) : (
        <ol
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--mg-surface-raised)', boxShadow: 'var(--mg-shadow-in)' }}
        >
          {records.map((r, i) => {
            const place = i + 1;
            const isHighlight = place === highlightRank;
            return (
              <li
                key={`${r.name}-${r.date}-${i}`}
                className="flex items-center gap-2.5 px-3 py-2 border-b last:border-b-0"
                style={{
                  borderColor: 'var(--mg-border)',
                  background: isHighlight ? 'var(--mg-card-matched-bg)' : 'transparent',
                }}
              >
                {/* Rank number / medal */}
                <span
                  className="w-5 text-center text-sm font-bold tabular-nums shrink-0"
                  style={{ color: MEDAL[place] ?? 'var(--mg-text-muted)' }}
                >
                  {place}
                </span>

                {/* Name */}
                <span
                  className="flex-1 min-w-0 truncate text-sm font-medium"
                  style={{ color: 'var(--mg-text)' }}
                >
                  {r.name || t.anonymous}
                  {isHighlight && (
                    <span style={{ color: 'var(--mg-accent)' }}> ←</span>
                  )}
                </span>

                {/* Score */}
                <span
                  className="text-sm font-bold tabular-nums shrink-0"
                  style={{
                    color: 'var(--mg-accent)',
                    fontFamily: 'var(--font-geist-mono, monospace)',
                  }}
                >
                  {r.score.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
