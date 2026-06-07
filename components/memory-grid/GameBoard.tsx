'use client';

import type { CardData } from './types';
import GameCard from './GameCard';

interface GameBoardProps {
  cards: CardData[];
  cols: number;
  rows: number;
  mismatchIds: number[];
  onCardClick: (id: number) => void;
}

/* ══════════════════════════════════════════════════════
   GameBoard
   The grid is sized so the whole board always fits inside
   the viewport height on desktop (the cards' 3:4 ratio is
   preserved). A progress bar shows pairs found so far.
   ══════════════════════════════════════════════════════ */
export default function GameBoard({
  cards,
  cols,
  rows,
  mismatchIds,
  onCardClick,
}: GameBoardProps) {
  const total   = cards.length / 2;
  const matched = cards.filter((c) => c.isMatched).length / 2;
  const pct     = total > 0 ? (matched / total) * 100 : 0;

  /* Board width : height ratio = (3·cols) : (4·rows) because each
     card is 3:4. Cap by height (so it fits the screen) and by an
     absolute max so cards never get comically large on wide monitors. */
  const ratio = (3 * cols) / (4 * rows);
  const maxWidth = `min(100%, calc((100dvh - 8rem) * ${ratio}), 40rem)`;

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-3xl p-4 mx-auto w-full"
      style={{ background: 'var(--mg-surface)', boxShadow: 'var(--mg-shadow)', maxWidth }}
    >
      {/* Header: BOARD label + pairs counter */}
      <div className="w-full flex items-center justify-between px-1">
        <span
          className="text-[10px] px-3 py-1 rounded-full tracking-[0.18em] uppercase border"
          style={{ borderColor: 'var(--mg-border)', color: 'var(--mg-text-muted)' }}
        >
          BOARD
        </span>
        <span
          className="text-xs font-bold tabular-nums"
          style={{ color: 'var(--mg-text-secondary)', fontFamily: 'var(--font-geist-mono, monospace)' }}
        >
          {matched} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--mg-border)' }}
        role="progressbar"
        aria-valuenow={matched}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--mg-grad-from), var(--mg-grad-to))',
          }}
        />
      </div>

      {/* Card grid — columns driven by difficulty */}
      <div
        role="grid"
        aria-label="Memory card grid"
        className="grid gap-[5px] w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card, i) => (
          <div key={card.id} role="gridcell">
            <GameCard
              card={card}
              index={i}
              isMismatch={mismatchIds.includes(card.id)}
              onClick={onCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
