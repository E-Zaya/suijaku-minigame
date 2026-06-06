'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { T, DIFFICULTY_CONFIG, CARD_ICONS } from '@/lib/memory-grid/constants';
import { calcScore } from '@/lib/memory-grid/scoring';
import { saveBest, isNewBest } from '@/lib/memory-grid/storage';
import StartScreen from './StartScreen';
import GameBoard from './GameBoard';
import GameStats from './GameStats';
import ClearScreen from './ClearScreen';
import type { CardData, Difficulty, GamePhase, Language, Theme } from './types';

/* ── Utilities ───────────────────────────────────────── */

/** Fisher-Yates shuffle – returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Create a shuffled deck for the chosen difficulty */
function buildDeck(difficulty: Difficulty): CardData[] {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];
  const deck: CardData[] = [];
  CARD_ICONS.slice(0, pairs).forEach((iconName, pairId) => {
    deck.push({ id: pairId * 2,     pairId, iconName, isFlipped: false, isMatched: false });
    deck.push({ id: pairId * 2 + 1, pairId, iconName, isFlipped: false, isMatched: false });
  });
  /* Reassign ids after shuffle so id === array index */
  return shuffle(deck).map((c, i) => ({ ...c, id: i }));
}

/* ══════════════════════════════════════════════════════
   MemoryGrid – top-level game controller
   ══════════════════════════════════════════════════════ */
export default function MemoryGrid() {

  /* ── Settings (lazy-initialised from localStorage) ──
     Safe: this component loads with ssr:false in page.tsx */
  const [lang,  setLang]  = useState<Language>(
    () => (localStorage.getItem('mg_lang')  as Language) || 'en'
  );
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('mg_theme') as Theme) || 'auto'
  );

  /* ── Game state ──────────────────────────────────── */
  const [phase,      setPhase]      = useState<GamePhase>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [cards,      setCards]      = useState<CardData[]>([]);
  const [mismatchIds, setMismatchIds] = useState<number[]>([]);
  const [mistakes,    setMistakes]   = useState(0);
  const [elapsed,     setElapsed]    = useState(0);
  const [isRunning,   setIsRunning]  = useState(false);
  const [finalScore,  setFinalScore] = useState(0);
  const [newBest,     setNewBest]    = useState(false);

  /* Refs for values needed inside callbacks without stale closures */
  const cardsRef      = useRef<CardData[]>([]);   // mirrors cards state
  const flippedRef    = useRef<number[]>([]);      // first-card slot (no re-render needed)
  const elapsedRef    = useRef(0);
  const mistakesRef   = useRef(0);
  const matchedRef    = useRef(0);
  const isLockedRef   = useRef(false);             // blocks clicks during mismatch delay

  /* Keep cardsRef in sync whenever cards state changes */
  useEffect(() => { cardsRef.current = cards; }, [cards]);

  /* ── Sync theme to <html data-theme> ─────────────── */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  /* ── Timer ───────────────────────────────────────── */
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  /* ── Start / restart ─────────────────────────────── */
  const startGame = useCallback((diff: Difficulty) => {
    elapsedRef.current  = 0;
    mistakesRef.current = 0;
    matchedRef.current  = 0;
    flippedRef.current  = [];
    isLockedRef.current = false;

    const deck = buildDeck(diff);
    cardsRef.current = deck;

    setDifficulty(diff);
    setCards(deck);
    setMismatchIds([]);
    setMistakes(0);
    setElapsed(0);
    setIsRunning(false);
    setFinalScore(0);
    setNewBest(false);
    setPhase('playing');
  }, []);

  /* ── Card tap handler (imperative style for clarity) ─ */
  const handleCardClick = useCallback((id: number) => {
    if (isLockedRef.current) return;

    const current = cardsRef.current;
    const card = current[id];
    if (!card || card.isFlipped || card.isMatched) return;

    /* Start timer on first tap */
    if (!isRunning) setIsRunning(true);

    if (flippedRef.current.length === 0) {
      /* ── First card of the pair ─────────────────── */
      flippedRef.current = [id];
      const flipped = current.map((c, i) => i === id ? { ...c, isFlipped: true } : c);
      cardsRef.current = flipped;
      setCards(flipped);

    } else {
      /* ── Second card – evaluate match ────────────── */
      const firstId = flippedRef.current[0];
      flippedRef.current = [];

      const withSecond = current.map((c, i) => i === id ? { ...c, isFlipped: true } : c);

      if (current[firstId].pairId === card.pairId) {
        /* ✅ Match */
        const matched = withSecond.map((c, i) =>
          i === firstId || i === id ? { ...c, isMatched: true } : c
        );
        cardsRef.current = matched;
        setCards(matched);
        matchedRef.current += 1;

        const { pairs } = DIFFICULTY_CONFIG[difficulty];
        if (matchedRef.current === pairs) {
          /* All pairs found – game over */
          const score = calcScore(elapsedRef.current, mistakesRef.current);
          const nb    = isNewBest(score, difficulty);
          if (nb) {
            saveBest({
              score,
              timeSeconds: elapsedRef.current,
              mistakes:    mistakesRef.current,
              difficulty,
              date: new Date().toISOString(),
            });
          }
          setFinalScore(score);
          setNewBest(nb);
          setIsRunning(false);
          /* Small pause so the last flip animation is visible */
          setTimeout(() => setPhase('cleared'), 420);
        }
      } else {
        /* ❌ Mismatch – show both cards briefly, then flip back */
        cardsRef.current = withSecond;
        setCards(withSecond);
        mistakesRef.current += 1;
        setMistakes(mistakesRef.current);
        setMismatchIds([firstId, id]);
        isLockedRef.current = true;

        setTimeout(() => {
          const reverted = cardsRef.current.map((c, i) =>
            i === firstId || i === id ? { ...c, isFlipped: false } : c
          );
          cardsRef.current = reverted;
          setCards(reverted);
          setMismatchIds([]);
          isLockedRef.current = false;
        }, 820);
      }
    }
  }, [difficulty, isRunning]);

  /* ── Settings toggles ────────────────────────────── */
  const toggleLang = () => {
    const next: Language = lang === 'en' ? 'ja' : 'en';
    setLang(next);
    localStorage.setItem('mg_lang', next);
  };

  const toggleTheme = () => {
    const cycle: Theme[] = ['auto', 'light', 'dark'];
    const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];
    setTheme(next);
    localStorage.setItem('mg_theme', next);
  };

  const t = T[lang];

  /* ══════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: 'var(--mg-bg)' }}>

      {/* ── Start screen ──────────────────────────── */}
      {phase === 'start' && (
        <StartScreen
          lang={lang}
          theme={theme}
          difficulty={difficulty}
          onStart={startGame}
          onSelectDifficulty={setDifficulty}
          onToggleLang={toggleLang}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* ── Playing screen ────────────────────────── */}
      {phase === 'playing' && (
        <div className="flex flex-col items-center gap-4 px-4 pt-5 pb-8 min-h-screen">

          {/* Title bar */}
          <div className="w-full max-w-sm flex items-center justify-between">
            <h1
              className="text-sm font-semibold tracking-wide"
              style={{ color: 'var(--mg-text-secondary)' }}
            >
              {t.title}
            </h1>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ background: 'var(--mg-surface)', color: 'var(--mg-text-muted)' }}
            >
              {t[difficulty]}
            </span>
          </div>

          <GameStats
            lang={lang}
            elapsed={elapsed}
            mistakes={mistakes}
            difficulty={difficulty}
          />

          <GameBoard
            cards={cards}
            cols={DIFFICULTY_CONFIG[difficulty].cols}
            mismatchIds={mismatchIds}
            onCardClick={handleCardClick}
          />

          <button
            onClick={() => startGame(difficulty)}
            className="mt-auto text-sm px-5 py-2 rounded-full border transition-all
                       opacity-50 hover:opacity-100 active:scale-[0.97]"
            style={{
              borderColor: 'var(--mg-border)',
              color: 'var(--mg-text-secondary)',
            }}
            aria-label="Restart current game"
          >
            ↺ {t.restart}
          </button>
        </div>
      )}

      {/* ── Cleared state ─────────────────────────── */}
      {phase === 'cleared' && (
        <>
          {/* Board stays visible behind the overlay */}
          <div className="flex flex-col items-center gap-4 px-4 pt-5 pb-8 min-h-screen">
            <div className="w-full max-w-sm">
              <h1 className="text-sm font-semibold" style={{ color: 'var(--mg-text-secondary)' }}>
                {t.title}
              </h1>
            </div>
            <GameStats lang={lang} elapsed={elapsed} mistakes={mistakes} difficulty={difficulty} />
            <GameBoard
              cards={cards}
              cols={DIFFICULTY_CONFIG[difficulty].cols}
              mismatchIds={[]}
              onCardClick={() => {}}
            />
          </div>

          <ClearScreen
            lang={lang}
            score={finalScore}
            elapsed={elapsed}
            mistakes={mistakes}
            difficulty={difficulty}
            isNewBest={newBest}
            onRestart={() => startGame(difficulty)}
            onHome={() => setPhase('start')}
          />
        </>
      )}
    </div>
  );
}
