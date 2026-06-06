'use client';

import {
  Sparkles, Gem, Rocket, Moon, Zap,
  Brain, Code, Coffee, Gamepad2, Star,
  type LucideIcon,
} from 'lucide-react';
import type { CardData, IconName } from './types';

/* Map icon name strings to the actual Lucide components */
const ICON_MAP: Record<IconName, LucideIcon> = {
  Sparkles, Gem, Rocket, Moon, Zap,
  Brain, Code, Coffee, Gamepad2, Star,
};

interface GameCardProps {
  card: CardData;
  isMismatch: boolean;
  onClick: (id: number) => void;
}

export default function GameCard({ card, isMismatch, onClick }: GameCardProps) {
  const Icon = ICON_MAP[card.iconName];
  const isVisible = card.isFlipped || card.isMatched;

  /* Build the class string for the 3-D inner element */
  const innerClass = [
    'mg-card-inner',
    isVisible      ? 'is-flipped'    : '',
    isMismatch     ? 'is-mismatch'   : '',
    card.isMatched ? 'mg-card-matched' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      /* perspective lives on the wrapper so transform-style works correctly */
      className="mg-card-wrapper block w-full aspect-square p-0 bg-transparent border-0
                 cursor-pointer rounded-2xl focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-offset-1
                 disabled:cursor-default"
      style={{ focusRingColor: 'var(--mg-grad-from)' } as React.CSSProperties}
      onClick={() => onClick(card.id)}
      disabled={card.isMatched}
      aria-label={isVisible ? card.iconName : 'Hidden card'}
      aria-pressed={isVisible}
    >
      <div className={innerClass} style={{ borderRadius: 'inherit' }}>

        {/* ── Back face – shown before flip ─────────── */}
        <div
          className="mg-card-face mg-card-back-face rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, var(--mg-grad-from), var(--mg-grad-to))',
            boxShadow: 'var(--mg-shadow-sm)',
          }}
          aria-hidden
        >
          {/* Subtle dot pattern for visual texture */}
          <div
            className="w-full h-full rounded-2xl opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '10px 10px',
            }}
          />
        </div>

        {/* ── Front face – shown after flip ─────────── */}
        <div
          className="mg-card-face mg-card-front-face rounded-2xl"
          style={{ boxShadow: 'var(--mg-shadow-sm)' }}
          aria-hidden={!isVisible}
        >
          <Icon
            size={28}
            strokeWidth={1.6}
            /* Matched cards turn amber; others use the theme icon colour */
            color={card.isMatched ? '#F59E0B' : 'var(--mg-card-icon)'}
            aria-hidden
          />
        </div>

      </div>
    </button>
  );
}
