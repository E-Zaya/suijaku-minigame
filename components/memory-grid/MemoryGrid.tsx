'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DIFFICULTY_CONFIG, CARD_ICONS } from '@/lib/memory-grid/constants';
import { calcScore } from '@/lib/memory-grid/scoring';
import { addRecord, getPlayerName, savePlayerName } from '@/lib/memory-grid/storage';
import StartScreen from './StartScreen';
import SidePanel from './SidePanel';
import GameBoard from './GameBoard';
import ClearScreen from './ClearScreen';
import type { CardData, Difficulty, GamePhase, Language, Theme } from './types';

/* ── Utilities ───────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(difficulty: Difficulty): CardData[] {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];
  const deck: CardData[] = [];
  CARD_ICONS.slice(0, pairs).forEach((iconName, pairId) => {
    deck.push({ id: pairId * 2,     pairId, iconName, isFlipped: false, isMatched: false });
    deck.push({ id: pairId * 2 + 1, pairId, iconName, isFlipped: false, isMatched: false });
  });
  return shuffle(deck).map((c, i) => ({ ...c, id: i }));
}

/* ══════════════════════════════════════════════════════
   MemoryGrid – top-level game controller
   ══════════════════════════════════════════════════════ */
export default function MemoryGrid() {

  /* ── Settings (lazy-init from localStorage — safe with ssr:false) ── */
  const [lang,  setLang]  = useState<Language>(() => (localStorage.getItem('mg_lang')  as Language) || 'en');
  const [theme, setTheme] = useState<Theme>(   () => (localStorage.getItem('mg_theme') as Theme)    || 'auto');
  const [playerName, setPlayerName] = useState<string>(() => getPlayerName());

  /* ── Game state ──────────────────────────────────── */
  const [phase,       setPhase]       = useState<GamePhase>('start');
  const [difficulty,  setDifficulty]  = useState<Difficulty>('normal');
  const [cards,       setCards]       = useState<CardData[]>([]);
  const [mismatchIds, setMismatchIds] = useState<number[]>([]);
  const [mistakes,    setMistakes]    = useState(0);
  const [elapsed,     setElapsed]     = useState(0);
  const [isRunning,   setIsRunning]   = useState(false);
  const [finalScore,  setFinalScore]  = useState(0);
  const [newBest,     setNewBest]     = useState(false);
  const [finalRank,   setFinalRank]   = useState(0);
  const [round,       setRound]       = useState(0);

  /* Refs — avoid stale closures inside setTimeout / setInterval */
  const cardsRef    = useRef<CardData[]>([]);
  const flippedRef  = useRef<number[]>([]);
  const elapsedRef  = useRef(0);
  const mistakesRef = useRef(0);
  const matchedRef  = useRef(0);
  const lockedRef   = useRef(false);
  const nameRef     = useRef(playerName);

  useEffect(() => { cardsRef.current = cards; }, [cards]);
  useEffect(() => { nameRef.current = playerName; }, [playerName]);

  /* ── Theme → <html data-theme> ───────────────────── */
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
    lockedRef.current   = false;

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
    setRound((r) => r + 1);
    setPhase('playing');
  }, []);

  /* ── Card tap handler ────────────────────────────── */
  const handleCardClick = useCallback((id: number) => {
    if (lockedRef.current) return;

    const current = cardsRef.current;
    const card = current[id];
    if (!card || card.isFlipped || card.isMatched) return;

    if (!isRunning) setIsRunning(true);

    if (flippedRef.current.length === 0) {
      /* First card */
      flippedRef.current = [id];
      const flipped = current.map((c, i) => i === id ? { ...c, isFlipped: true } : c);
      cardsRef.current = flipped;
      setCards(flipped);

    } else {
      /* Second card — evaluate */
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

        if (matchedRef.current === DIFFICULTY_CONFIG[difficulty].pairs) {
          const score = calcScore(elapsedRef.current, mistakesRef.current);
          const placedRank = addRecord(difficulty, {
            name:        nameRef.current.trim(),
            score,
            timeSeconds: elapsedRef.current,
            mistakes:    mistakesRef.current,
            date:        new Date().toISOString(),
          });
          setFinalScore(score);
          setNewBest(placedRank === 1);
          setFinalRank(placedRank);
          setIsRunning(false);
          setTimeout(() => setPhase('cleared'), 420);
        }
      } else {
        /* ❌ Mismatch */
        cardsRef.current = withSecond;
        setCards(withSecond);
        mistakesRef.current += 1;
        setMistakes(mistakesRef.current);
        setMismatchIds([firstId, id]);
        lockedRef.current = true;

        setTimeout(() => {
          const reverted = cardsRef.current.map((c, i) =>
            i === firstId || i === id ? { ...c, isFlipped: false } : c
          );
          cardsRef.current = reverted;
          setCards(reverted);
          setMismatchIds([]);
          lockedRef.current = false;
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
  const changeName = (name: string) => {
    setPlayerName(name);
    savePlayerName(name);
  };

  /* Reusable JSX for the two-column game layout */
  const boardLayout = (interactive: boolean) => (
    <div className="flex flex-col md:flex-row gap-4 min-h-screen md:h-screen md:overflow-hidden p-3 md:p-5 items-start md:items-stretch">
      <SidePanel
        lang={lang}
        elapsed={elapsed}
        mistakes={mistakes}
        difficulty={difficulty}
        onRestart={() => startGame(difficulty)}
        onBack={() => setPhase('start')}
      />
      <div className="flex-1 w-full min-w-0 flex items-center justify-center">
        <GameBoard
          key={round}
          cards={cards}
          cols={DIFFICULTY_CONFIG[difficulty].cols}
          rows={DIFFICULTY_CONFIG[difficulty].rows}
          mismatchIds={interactive ? mismatchIds : []}
          onCardClick={interactive ? handleCardClick : () => {}}
        />
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     Render
     ══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen" style={{ background: 'var(--mg-bg)' }}>

      {phase === 'start' && (
        <StartScreen
          lang={lang}
          theme={theme}
          difficulty={difficulty}
          playerName={playerName}
          onNameChange={changeName}
          onStart={startGame}
          onSelectDifficulty={setDifficulty}
          onToggleLang={toggleLang}
          onToggleTheme={toggleTheme}
        />
      )}

      {phase === 'playing' && boardLayout(true)}

      {phase === 'cleared' && (
        <>
          {/* Board stays visible behind the overlay */}
          {boardLayout(false)}

          <ClearScreen
            lang={lang}
            score={finalScore}
            elapsed={elapsed}
            mistakes={mistakes}
            difficulty={difficulty}
            isNewBest={newBest}
            rank={finalRank}
            playerName={playerName}
            onRestart={() => startGame(difficulty)}
            onHome={() => setPhase('start')}
          />
        </>
      )}

    </div>
  );
}
