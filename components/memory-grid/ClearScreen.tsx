'use client';

import { useState } from 'react';
import { Share2, Copy, RotateCcw, Home } from 'lucide-react';
import { T } from '@/lib/memory-grid/constants';
import { formatTime } from '@/lib/memory-grid/scoring';
import type { Difficulty, Language } from './types';

interface ClearScreenProps {
  lang: Language;
  score: number;
  elapsed: number;
  mistakes: number;
  difficulty: Difficulty;
  isNewBest: boolean;
  onRestart: () => void;
  onHome: () => void;
}

/* Floating confetti particles – purely decorative */
function Confetti() {
  const particles = [
    { char: '✦', cls: 'mg-cf-a', left: '12%',  color: '#4A7CF6', delay: '0s'    },
    { char: '★', cls: 'mg-cf-b', left: '25%',  color: '#F59E0B', delay: '0.05s' },
    { char: '◆', cls: 'mg-cf-c', left: '40%',  color: '#7C3AED', delay: '0.1s'  },
    { char: '●', cls: 'mg-cf-a', left: '55%',  color: '#10B981', delay: '0.08s' },
    { char: '★', cls: 'mg-cf-b', left: '68%',  color: '#EC4899', delay: '0.15s' },
    { char: '✦', cls: 'mg-cf-c', left: '80%',  color: '#F59E0B', delay: '0.03s' },
    { char: '◆', cls: 'mg-cf-a', left: '90%',  color: '#4A7CF6', delay: '0.12s' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className={`absolute text-xl ${p.cls}`}
          style={{ left: p.left, top: '55%', color: p.color, animationDelay: p.delay }}
        >
          {p.char}
        </span>
      ))}
    </div>
  );
}

/* One row in the result table */
function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0"
         style={{ borderColor: 'var(--mg-border)' }}>
      <span className="text-sm" style={{ color: 'var(--mg-text-secondary)' }}>{label}</span>
      <span className="text-sm font-semibold tabular-nums" style={{ color: 'var(--mg-text)' }}>
        {value}
      </span>
    </div>
  );
}

export default function ClearScreen({
  lang,
  score,
  elapsed,
  mistakes,
  difficulty,
  isNewBest,
  onRestart,
  onHome,
}: ClearScreenProps) {
  const t = T[lang];
  const [copied, setCopied] = useState(false);

  /* Build the share text in the user's language */
  function buildShareText(): string {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (lang === 'ja') {
      return (
        `Memory Gridをクリア！\n` +
        `Score: ${score}\n` +
        `Time: ${elapsed}s\n` +
        `Mistakes: ${mistakes}\n\n` +
        `Zaya's Playgroundで遊ぶ →\n${url}`
      );
    }
    return (
      `I cleared Memory Grid!\n` +
      `Score: ${score}\n` +
      `Time: ${elapsed}s\n` +
      `Mistakes: ${mistakes}\n\n` +
      `Play it on Zaya's Playground →\n${url}`
    );
  }

  async function handleShare() {
    const text = buildShareText();
    /* Use native share sheet on mobile if available */
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or not supported – fall through to clipboard
      }
    }
    /* Clipboard fallback */
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard also unavailable; nothing to do
    }
  }

  return (
    /* Full-screen overlay with backdrop blur */
    <div
      className="fixed inset-0 flex items-center justify-center px-4 z-50"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label={t.cleared}
    >
      {/* Confetti burst behind the card */}
      <Confetti />

      {/* Result card */}
      <div
        className="relative w-full max-w-xs rounded-3xl p-6 mg-slide-up"
        style={{
          background: 'var(--mg-surface)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* ── Header ────────────────────────────────── */}
        <div className="text-center mb-4">
          <p className="text-4xl mb-1" aria-hidden>🏆</p>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--mg-text)' }}>
            {t.cleared}
          </h2>
          {isNewBest && (
            <span
              className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))',
                color: '#fff',
              }}
            >
              {t.newBest}
            </span>
          )}
        </div>

        {/* ── Result table ──────────────────────────── */}
        <div
          className="rounded-2xl px-4 mb-5"
          style={{ background: 'var(--mg-surface-raised)', boxShadow: 'var(--mg-shadow-in)' }}
        >
          <ResultRow label={t.score}    value={score.toLocaleString()} />
          <ResultRow label={t.time}     value={`${formatTime(elapsed)}s`} />
          <ResultRow label={t.mistakes} value={String(mistakes)} />
          <ResultRow label={t.difficulty.charAt(0).toUpperCase() + t.difficulty.slice(1)}
                     value={t[difficulty]} />
          {/* Date stamp */}
          <ResultRow
            label={lang === 'ja' ? '日付' : 'Date'}
            value={new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          />
        </div>

        {/* ── Action buttons ────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          {/* Share */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full
                       text-sm font-semibold text-white transition-all duration-150
                       active:scale-[0.97]"
            style={{
              background: 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))',
              boxShadow: '0 4px 14px rgba(74,124,246,0.4)',
            }}
          >
            {copied ? (
              <><Copy size={15} /> {t.copied}</>
            ) : (
              <><Share2 size={15} /> {t.share}</>
            )}
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full
                       text-sm font-medium transition-all duration-150 active:scale-[0.97]"
            style={{
              background: 'var(--mg-surface-raised)',
              boxShadow: 'var(--mg-shadow-sm)',
              color: 'var(--mg-text)',
            }}
          >
            <RotateCcw size={15} /> {t.restart}
          </button>

          {/* Back to start */}
          <button
            onClick={onHome}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm
                       transition-opacity opacity-60 hover:opacity-100"
            style={{ color: 'var(--mg-text-secondary)' }}
          >
            <Home size={13} />
            {lang === 'en' ? 'Change difficulty' : '難易度を変える'}
          </button>
        </div>
      </div>
    </div>
  );
}
