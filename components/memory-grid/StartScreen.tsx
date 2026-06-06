'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { T } from '@/lib/memory-grid/constants';
import { getBest } from '@/lib/memory-grid/storage';
import type { Difficulty, Language, Theme } from './types';

interface StartScreenProps {
  lang: Language;
  theme: Theme;
  difficulty: Difficulty;
  onStart: (difficulty: Difficulty) => void;
  onSelectDifficulty: (d: Difficulty) => void;
  onToggleLang: () => void;
  onToggleTheme: () => void;
}

/* Theme icon for the current theme value */
function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark')  return <Moon  size={16} />;
  if (theme === 'light') return <Sun   size={16} />;
  return <Monitor size={16} />;
}

/* Difficulty row item */
function DifficultyOption({
  id,
  label,
  desc,
  best,
  bestLabel,
  isSelected,
  onSelect,
}: {
  id: Difficulty;
  label: string;
  desc: string;
  best: number | null;
  bestLabel: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  /* Kanji badges matching the game's difficulty system */
  const kanji: Record<Difficulty, string> = { easy: '初', normal: '中', hard: '上' };

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left
                 transition-all duration-150 border-2 cursor-pointer"
      style={{
        background:   isSelected ? 'var(--mg-surface-raised)' : 'var(--mg-surface)',
        borderColor:  isSelected ? 'var(--mg-grad-from)' : 'transparent',
        boxShadow:    isSelected ? 'var(--mg-shadow)' : 'var(--mg-shadow-sm)',
        color: 'var(--mg-text)',
      }}
      aria-pressed={isSelected}
      aria-label={`${label} – ${desc}`}
    >
      {/* Kanji badge */}
      <span
        className="w-9 h-9 flex items-center justify-center rounded-lg text-lg font-semibold shrink-0"
        style={{
          background: isSelected
            ? 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))'
            : 'var(--mg-border)',
          color: isSelected ? '#fff' : 'var(--mg-text-secondary)',
        }}
      >
        {kanji[id]}
      </span>

      {/* Label + description */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: 'var(--mg-text)' }}>{label}</p>
        <p className="text-xs mt-0.5"       style={{ color: 'var(--mg-text-muted)' }}>{desc}</p>
      </div>

      {/* Best score badge */}
      {best !== null && (
        <span
          className="text-[11px] font-medium shrink-0"
          style={{ color: 'var(--mg-text-secondary)' }}
        >
          {bestLabel} {best.toLocaleString()}
        </span>
      )}
    </button>
  );
}

export default function StartScreen({
  lang,
  theme,
  difficulty,
  onStart,
  onSelectDifficulty,
  onToggleLang,
  onToggleTheme,
}: StartScreenProps) {
  const t = T[lang];

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];
  const descKey: Record<Difficulty, 'easyDesc' | 'normalDesc' | 'hardDesc'> = {
    easy: 'easyDesc', normal: 'normalDesc', hard: 'hardDesc',
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'var(--mg-bg)' }}
    >
      {/* ── Top controls bar ──────────────────────────── */}
      <div className="w-full max-w-sm flex justify-end gap-2 mb-8">
        {/* Language toggle */}
        <button
          onClick={onToggleLang}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
          style={{
            borderColor: 'var(--mg-border)',
            color: 'var(--mg-text-secondary)',
            background: 'var(--mg-surface)',
          }}
          aria-label={`Switch language (current: ${lang.toUpperCase()})`}
        >
          {lang === 'en' ? 'JP' : 'EN'}
        </button>

        {/* Theme cycle: auto → light → dark */}
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full border transition-all"
          style={{
            borderColor: 'var(--mg-border)',
            color: 'var(--mg-text-secondary)',
            background: 'var(--mg-surface)',
          }}
          aria-label={`Cycle theme (current: ${theme})`}
        >
          <ThemeIcon theme={theme} />
        </button>
      </div>

      {/* ── Title card ────────────────────────────────── */}
      <div
        className="w-full max-w-sm rounded-3xl p-6 mb-4"
        style={{ background: 'var(--mg-surface)', boxShadow: 'var(--mg-shadow)' }}
      >
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--mg-text)' }}>
            {t.title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--mg-text-secondary)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Difficulty selector */}
        <p
          className="text-[11px] uppercase tracking-widest font-medium mb-2 px-1"
          style={{ color: 'var(--mg-text-muted)' }}
        >
          {t.difficulty}
        </p>
        <div className="flex flex-col gap-2 mb-6">
          {difficulties.map((d) => {
            const best = getBest(d);
            return (
              <DifficultyOption
                key={d}
                id={d}
                label={t[d]}
                desc={t[descKey[d]]}
                best={best?.score ?? null}
                bestLabel={t.best}
                isSelected={difficulty === d}
                onSelect={() => onSelectDifficulty(d)}
              />
            );
          })}
        </div>

        {/* Start button */}
        <button
          onClick={() => onStart(difficulty)}
          className="w-full py-3.5 rounded-full text-base font-semibold text-white
                     transition-all duration-150 active:scale-[0.97]
                     focus-visible:outline-none focus-visible:ring-2"
          style={{
            background: 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))',
            boxShadow: '0 4px 14px rgba(74,124,246,0.4)',
          }}
          aria-label={`${t.start} – ${t[difficulty]} difficulty`}
        >
          {t.start}
        </button>
      </div>

      {/* Subtle footer hint */}
      <p className="text-[11px] text-center mt-2" style={{ color: 'var(--mg-text-muted)' }}>
        {lang === 'en'
          ? 'Tap a card to reveal it. Match all pairs to win.'
          : 'カードをタップして全ペアを合わせよう。'}
      </p>
    </div>
  );
}
