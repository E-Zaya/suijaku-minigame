'use client';

import { Trophy, Timer, AlertCircle, RotateCcw, ChevronLeft } from 'lucide-react';
import { T } from '@/lib/memory-grid/constants';
import { calcScore } from '@/lib/memory-grid/scoring';
import { getBest } from '@/lib/memory-grid/storage';
import type { Difficulty, Language } from './types';

/* Kanji badges matching the difficulty selector */
const KANJI: Record<Difficulty, string> = { easy: '初', normal: '中', hard: '上' };

/* ── Stat display box ──────────────────────────────────
   Matches the neumorphic inset style of the reference.
   Icon + label on the left, large monospace value on the right.
   ─────────────────────────────────────────────────── */
function StatBox({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
      style={{ background: 'var(--mg-surface-raised)', boxShadow: 'var(--mg-shadow-in)' }}
    >
      <span className="shrink-0" style={{ color: 'var(--mg-text-muted)' }}>{icon}</span>
      <span
        className="flex-1 text-[10px] uppercase tracking-widest font-medium"
        style={{ color: 'var(--mg-text-secondary)' }}
      >
        {label}
      </span>
      {/* Monospace value — Geist Mono for the digital-counter feel */}
      <span
        className="text-lg font-bold tabular-nums tracking-wider shrink-0"
        style={{
          color: accent ? 'var(--mg-accent)' : 'var(--mg-text)',
          fontFamily: 'var(--font-geist-mono, monospace)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* Compact version used in the mobile top row */
function CompactStat({
  icon,
  value,
  accent,
}: {
  icon: React.ReactNode;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl"
      style={{ background: 'var(--mg-surface-raised)', boxShadow: 'var(--mg-shadow-in)' }}
    >
      <span style={{ color: 'var(--mg-text-muted)' }}>{icon}</span>
      <span
        className="text-base font-bold tabular-nums leading-none"
        style={{
          color: accent ? 'var(--mg-accent)' : 'var(--mg-text)',
          fontFamily: 'var(--font-geist-mono, monospace)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* Full-width panel button — icon + label, neumorphic outer shadow */
function PanelButton({
  icon,
  label,
  onClick,
  subtle,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  subtle?: boolean;
}) {
  if (subtle) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 text-sm py-1.5 px-1 rounded-lg
                   transition-opacity opacity-55 hover:opacity-100 active:scale-[0.97]"
        style={{ color: 'var(--mg-text-secondary)' }}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                 transition-all active:scale-[0.97]"
      style={{
        background: 'var(--mg-surface-raised)',
        boxShadow: 'var(--mg-shadow)',
        color: 'var(--mg-text)',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   SidePanel
   ──────────────────────────────────────────────────────
   Mobile  → compact top bar (full-width horizontal stats)
   Desktop → vertical sidebar (matches the reference image)
   ══════════════════════════════════════════════════════ */
interface SidePanelProps {
  lang: Language;
  elapsed: number;
  mistakes: number;
  difficulty: Difficulty;
  onRestart: () => void;
  onBack: () => void;
}

export default function SidePanel({
  lang,
  elapsed,
  mistakes,
  difficulty,
  onRestart,
  onBack,
}: SidePanelProps) {
  const t    = T[lang];
  const score = calcScore(elapsed, mistakes);
  const best  = getBest(difficulty);

  /* Zero-padded display values for the digital counter look */
  const scoreDisplay    = String(score).padStart(5, '0');
  const timeDisplay     = String(elapsed).padStart(3, '0') + 's';
  const mistakesDisplay = String(mistakes).padStart(3, '0');

  /* Human-readable best-score date */
  const bestDate = best
    ? new Date(best.date).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null;

  return (
    <div
      className="w-full md:w-56 shrink-0 rounded-3xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--mg-surface)', boxShadow: 'var(--mg-shadow)' }}
    >
      {/* ── Header pill (always visible) ────────────── */}
      <div className="flex justify-center">
        <span
          className="text-[10px] px-3 py-1 rounded-full tracking-[0.18em] uppercase border"
          style={{ borderColor: 'var(--mg-border)', color: 'var(--mg-text-muted)' }}
        >
          PLAYER · STATS
        </span>
      </div>

      {/* ── Title + difficulty badge ──────────────────
           Full form on desktop, compact row on mobile   */}
      <div className="flex items-center justify-between md:block gap-3">
        <h1
          className="text-base md:text-lg font-bold"
          style={{ color: 'var(--mg-text)' }}
        >
          {t.title}
        </h1>
        <div className="flex items-center gap-2 md:mt-1.5">
          <span
            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg text-sm font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))',
              color: '#fff',
            }}
          >
            {KANJI[difficulty]}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--mg-text-secondary)' }}>
            {t[difficulty]}
          </span>
        </div>
      </div>

      {/* ── Divider (desktop only) ───────────────────── */}
      <hr className="hidden md:block" style={{ borderColor: 'var(--mg-border)' }} />

      {/* ── MOBILE: compact 3-column stats ───────────── */}
      <div className="flex md:hidden gap-2">
        <CompactStat icon={<Trophy size={14} />}       value={scoreDisplay}    accent />
        <CompactStat icon={<Timer size={14} />}         value={timeDisplay} />
        <CompactStat icon={<AlertCircle size={14} />}   value={mistakesDisplay} accent={mistakes > 0} />
      </div>

      {/* ── DESKTOP: full stat boxes stacked ─────────── */}
      <div className="hidden md:flex flex-col gap-2">
        <StatBox icon={<Trophy size={15} />}      label={t.score}    value={scoreDisplay}    accent />
        <StatBox icon={<Timer size={15} />}        label={t.time}     value={timeDisplay} />
        <StatBox icon={<AlertCircle size={15} />}  label={t.mistakes} value={mistakesDisplay} accent={mistakes > 0} />
      </div>

      {/* ── Divider (desktop only) ───────────────────── */}
      <hr className="hidden md:block" style={{ borderColor: 'var(--mg-border)' }} />

      {/* ── Action buttons ────────────────────────────
           Row on mobile, stacked on desktop            */}
      <div className="flex flex-row md:flex-col gap-2">
        <div className="flex-1 md:flex-none">
          <PanelButton
            icon={<RotateCcw size={15} />}
            label={t.restart}
            onClick={onRestart}
          />
        </div>
        <div className="flex-1 md:flex-none">
          <PanelButton
            icon={<ChevronLeft size={15} />}
            label={lang === 'en' ? '← Difficulty' : '← 難易度'}
            onClick={onBack}
            subtle
          />
        </div>
      </div>

      {/* ── Best score (desktop only) ─────────────────── */}
      {best && (
        <div className="hidden md:block mt-auto pt-1" aria-label="Personal best">
          <p className="text-[11px]" style={{ color: 'var(--mg-text-muted)' }}>
            {t.best}:&ensp;
            <span className="font-semibold" style={{ color: 'var(--mg-text-secondary)' }}>
              {best.score.toLocaleString()}
            </span>
          </p>
          {bestDate && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--mg-text-muted)' }}>
              {bestDate}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
