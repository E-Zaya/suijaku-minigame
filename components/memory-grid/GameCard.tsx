'use client';

import { ICON_LABELS } from '@/lib/memory-grid/constants';
import type { CardData } from './types';

interface GameCardProps {
  card: CardData;
  index: number;
  isMismatch: boolean;
  onClick: (id: number) => void;
}

export default function GameCard({ card, index, isMismatch, onClick }: GameCardProps) {
  const isVisible = card.isFlipped || card.isMatched;
  const label = ICON_LABELS[card.iconName];

  const innerClass = [
    'mg-card-inner',
    isVisible      ? 'is-flipped'     : '',
    isMismatch     ? 'is-mismatch'    : '',
    card.isMatched ? 'mg-card-matched': '',
  ].filter(Boolean).join(' ');

  return (
    <button
      /* perspective wrapper sits on the button so preserve-3d works */
      className="mg-card-wrapper mg-deal block w-full aspect-[3/4] p-0 bg-transparent border-0
                 cursor-pointer rounded-2xl
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
                 disabled:cursor-default"
      style={{ animationDelay: `${Math.min(index, 20) * 28}ms` }}
      onClick={() => onClick(card.id)}
      disabled={card.isMatched}
      aria-label={isVisible ? label : 'Hidden card'}
      aria-pressed={isVisible}
    >
      <div className={innerClass} style={{ borderRadius: 'inherit' }}>

        {/* ── Back face – subtle gradient with dot pattern ─── */}
        <div
          className="mg-card-face mg-card-back-face rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))',
            boxShadow: 'var(--mg-shadow-sm)',
          }}
          aria-hidden
        >
          {/* Subtle repeating dot texture */}
          <div
            className="w-full h-full rounded-2xl opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '11px 11px',
            }}
          />
        </div>

        {/* ── Front face – emoji on a clean surface ── */}
        <div
          className="mg-card-face mg-card-front-face rounded-2xl select-none"
          style={{ boxShadow: 'var(--mg-shadow-sm)' }}
          aria-hidden={!isVisible}
        >
          <span
            className="leading-none"
            style={{ fontSize: 'clamp(1.6rem, 7vw, 2.2rem)' }}
            role="img"
            aria-label={label}
          >
            {card.iconName}
          </span>
        </div>

      </div>
    </button>
  );
}
