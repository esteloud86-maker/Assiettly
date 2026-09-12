"use client";

import { useEffect, useMemo, useRef } from "react";

const HAUTEUR_ITEM = 44;
const HAUTEUR_CONTENEUR = 220;
const PADDING_VERTICAL = (HAUTEUR_CONTENEUR - HAUTEUR_ITEM) / 2;

interface MoletteValeurProps {
  min: number;
  max: number;
  valeur: number | null;
  onChange: (v: number) => void;
  suffixe?: string;
  pas?: number;
  largeur?: string;
}

/**
 * Sélecteur de valeur type molette (scroll-snap natif, sans librairie) :
 * on fait défiler verticalement, la valeur au centre est sélectionnée.
 */
export function MoletteValeur({ min, max, valeur, onChange, suffixe, pas = 1, largeur }: MoletteValeurProps) {
  const conteneurRef = useRef<HTMLDivElement>(null);
  const valeurs = useMemo(() => {
    const liste: number[] = [];
    for (let v = min; v <= max; v += pas) liste.push(Math.round(v * 10) / 10);
    return liste;
  }, [min, max, pas]);

  useEffect(() => {
    if (!conteneurRef.current) return;
    const index = valeur !== null ? valeurs.indexOf(valeur) : Math.floor(valeurs.length / 2);
    conteneurRef.current.scrollTop = Math.max(0, index) * HAUTEUR_ITEM;
    // On ne veut recentrer qu'au montage, pas à chaque changement de `valeur`
    // (sinon impossible de faire défiler : le scroll serait réinitialisé en boucle).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onScroll() {
    if (!conteneurRef.current) return;
    const index = Math.round(conteneurRef.current.scrollTop / HAUTEUR_ITEM);
    const v = valeurs[Math.min(Math.max(index, 0), valeurs.length - 1)];
    if (v !== undefined && v !== valeur) onChange(v);
  }

  return (
    <div className="relative" style={{ width: largeur }}>
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
        {valeurs.map((v) => (
          <div
            key={v}
            className={`flex items-center justify-center font-titre text-2xl font-semibold transition-colors ${
              v === valeur ? "text-charbon-800" : "text-charbon-400/40"
            }`}
            style={{ height: HAUTEUR_ITEM, scrollSnapAlign: "center" }}
          >
            {v}
            {suffixe ? <span className="ml-1 text-sm font-normal text-charbon-400">{suffixe}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
