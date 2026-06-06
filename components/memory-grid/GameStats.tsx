'use client';

import { useEffect, useRef } from 'react';
import { T } from '@/lib/memory-grid/constants';
import { calcScore, formatTime } from '@/lib/memory-grid/scoring';
import { getBest } from '@/lib/memory-grid/storage';
import type { Difficulty, Language } from './types';

interface GameStatsProps {
  lang: Language;
  elapsed: number;
  mistakes: number;
  difficulty: Difficulty;
}

/* Single labelled stat cell */
function StatCell({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) {
  /* Animate the value element whenever it changes */
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value && ref.current) {
      ref.current.classList.remove('mg-pop');
      void ref.current.offsetWidth; // force reflow to restart animation
      ref.current.classList.add('mg-pop');
    }
    prevRef.current = value;
  }, [value]);

  return (
    <div
      className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl"
      style={{ background: 'var(--mg-surface)', boxShadow: 'var(--mg-shadow-in)' }}
    >
      <span
        className="text-[10px] uppercase tracking-widest font-medium"
        style={{ color: 'var(--mg-text-muted)' }}
      >
        {label}
      </span>
      <span
        ref={ref}
        className="text-lg font-semibold tabular-nums leading-none"
        style={{ color: 'var(--mg-text)', ...valueStyle }}
      >
        {value}
      </span>
    </div>
  );
}

export default function GameStats({
  lang,
  elapsed,
  mistakes,
  difficulty,
}: GameStatsProps) {
  const t = T[lang];
  const score = calcScore(elapsed, mistakes);
  const best  = getBest(difficulty);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Main row: Time · Mistakes · Score */}
      <div className="grid grid-cols-3 gap-2">
        <StatCell label={t.time}     value={`${formatTime(elapsed)}s`} />
        <StatCell
          label={t.mistakes}
          value={String(mistakes)}
          valueStyle={mistakes > 0 ? { color: '#E05252' } : undefined}
        />
        <StatCell label={t.score}    value={score.toLocaleString()} />
      </div>

      {/* Best score – shown below if a record exists */}
      {best && (
        <p
          className="text-center text-[11px] mt-1.5"
          style={{ color: 'var(--mg-text-muted)' }}
        >
          {t.best}:&nbsp;
          <span style={{ color: 'var(--mg-text-secondary)' }}>
            {best.score.toLocaleString()}
          </span>
        </p>
      )}
    </div>
  );
}
