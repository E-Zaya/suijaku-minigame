'use client';

import dynamic from "next/dynamic";

/* Load the game client-only so localStorage is always available
   in state initialisers without hydration-mismatch concerns */
const MemoryGrid = dynamic(() => import("@/components/memory-grid/MemoryGrid"), {
  ssr: false,
});

export default function Home() {
  return <MemoryGrid />;
}
