'use client';

import type { CardData } from './types';
import GameCard from './GameCard';

interface GameBoardProps {
  cards: CardData[];
  cols: number;
  mismatchIds: number[];
  onCardClick: (id: number) => void;
}

export default function GameBoard({
  cards,
  cols,
  mismatchIds,
  onCardClick,
}: GameBoardProps) {
  return (
    /* Outer wrapper limits board width and centres it */
    <div className="w-full max-w-sm mx-auto px-1">
      <div
        role="grid"
        aria-label="Memory card grid"
        className="grid gap-[5px]"
        /* Column count is dynamic – driven by difficulty setting */
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
