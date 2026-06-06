'use client';

import type { CardData } from './types';
import GameCard from './GameCard';

interface GameBoardProps {
  cards: CardData[];
  cols: number;
  mismatchIds: number[];
  onCardClick: (id: number) => void;
}

/* ══════════════════════════════════════════════════════
   GameBoard
   Wraps the card grid in the neumorphic board container
   with the "BOARD" pill label at the top, matching the
   reference image layout.
   ══════════════════════════════════════════════════════ */
export default function GameBoard({
  cards,
  cols,
  mismatchIds,
  onCardClick,
}: GameBoardProps) {
  return (
    <div
      className="w-full flex flex-col items-center gap-4 rounded-3xl p-4"
      style={{ background: 'var(--mg-surface)', boxShadow: 'var(--mg-shadow)' }}
    >
      {/* BOARD label pill — matches the reference header tag style */}
      <span
        className="text-[10px] px-3 py-1 rounded-full tracking-[0.18em] uppercase border"
        style={{ borderColor: 'var(--mg-border)', color: 'var(--mg-text-muted)' }}
      >
        BOARD
      </span>

      {/* Card grid — columns driven by difficulty */}
      <div
        role="grid"
        aria-label="Memory card grid"
        className="grid gap-[5px] w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cards.map((card) => (
          <div key={card.id} role="gridcell">
            <GameCard
              card={card}
              isMismatch={mismatchIds.includes(card.id)}
              onClick={onCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
