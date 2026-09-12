"use client";

import { useEffect, useRef } from "react";

const HAUTEUR_ITEM = 44;
const HAUTEUR_CONTENEUR = 220;
const PADDING_VERTICAL = (HAUTEUR_CONTENEUR - HAUTEUR_ITEM) / 2;

interface MoletteValeurGeneriqueProps {
  options: string[];
  index: number;
  onChange: (index: number) => void;
}

/** Comme MoletteValeur, mais pour une liste de libellés (ex : les mois) plutôt que des nombres. */
export function MoletteValeurGenerique({ options, index, onChange }: MoletteValeurGeneriqueProps) {
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conteneurRef.current) return;
    conteneurRef.current.scrollTop = Math.max(0, index) * HAUTEUR_ITEM;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScroll() {
    if (!conteneurRef.current) return;
    const nouvelIndex = Math.round(conteneurRef.current.scrollTop / HAUTEUR_ITEM);
    const clamped = Math.min(Math.max(nouvelIndex, 0), options.length - 1);
    if (clamped !== index) onChange(clamped);
  }

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-11 -translate-y-1/2 rounded-2xl border-2 border-corail-500"
        aria-hidden
      />
      <div
        ref={conteneurRef}
        onScroll={onScroll}
        className="molette-scroll overflow-y-scroll"
        style={{ height: HAUTEUR_CONTENEUR, scrollSnapType: "y mandatory", paddingBlock: PADDING_VERTICAL }}
      >
        {options.map((label, i) => (
          <div
            key={label}
            className={`flex items-center justify-center px-2 text-center font-titre text-lg font-semibold transition-colors ${
              i === index ? "text-charbon-800" : "text-charbon-400/40"
            }`}
            style={{ height: HAUTEUR_ITEM, scrollSnapAlign: "center" }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
