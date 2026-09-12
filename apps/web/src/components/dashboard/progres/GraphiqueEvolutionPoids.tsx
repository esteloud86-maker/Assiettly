"use client";

import { useMemo, useState } from "react";

interface Point {
  date: string;
  poidsKg: number;
}

const PERIODES = [
  { valeur: 90, label: "90 jours" },
  { valeur: 182, label: "6 mois" },
  { valeur: 365, label: "1 an" },
  { valeur: null, label: "Tout" },
] as const;

const LARGEUR = 300;
const HAUTEUR = 120;
const MARGE = 16;

export function GraphiqueEvolutionPoids({
  points,
  poidsCibleKg,
}: {
  points: Point[];
  poidsCibleKg: number | null;
}) {
  const [periodeJours, setPeriodeJours] = useState<number | null>(90);
  const [indexSurvole, setIndexSurvole] = useState<number | null>(null);

  const pointsFiltres = useMemo(() => {
    if (periodeJours === null) return points;
    const seuil = Date.now() - periodeJours * 86_400_000;
    return points.filter((p) => new Date(p.date).getTime() >= seuil);
  }, [points, periodeJours]);

  const poidsInitial = points[0]?.poidsKg ?? null;
  const poidsActuel = points.at(-1)?.poidsKg ?? null;
  const pctObjectif =
    poidsInitial !== null && poidsActuel !== null && poidsCibleKg !== null && poidsInitial !== poidsCibleKg
      ? Math.round(Math.min(1, Math.max(0, (poidsInitial - poidsActuel) / (poidsInitial - poidsCibleKg))) * 100)
      : null;

  if (pointsFiltres.length < 2) {
    return (
      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-2 font-titre font-semibold text-charbon-800">Évolution du poids</h2>
        <p className="py-8 text-center text-charbon-400">Ajoute au moins deux pesées pour voir ta tendance.</p>
      </div>
    );
  }

  const poids = pointsFiltres.map((p) => p.poidsKg);
  const min = Math.min(...poids);
  const max = Math.max(...poids);
  const echelle = max - min || 1;

  const coords = pointsFiltres.map((p, i) => ({
    x: MARGE + (i / (pointsFiltres.length - 1)) * (LARGEUR - 2 * MARGE),
    y: HAUTEUR - MARGE - ((p.poidsKg - min) / echelle) * (HAUTEUR - 2 * MARGE),
  }));

  const pointActif = indexSurvole !== null ? pointsFiltres[indexSurvole] : pointsFiltres.at(-1)!;

  return (
    <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-titre font-semibold text-charbon-800">Évolution du poids</h2>
        {pctObjectif !== null ? (
          <span className="rounded-full bg-sarcelle-100 px-3 py-1 text-xs font-semibold text-sarcelle-600">
            {pctObjectif}% de l&rsquo;objectif
          </span>
        ) : null}
      </div>

      <p className="mb-2 text-sm text-charbon-400">
        {pointActif.poidsKg} kg —{" "}
        {new Date(pointActif.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
      </p>

      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        className="h-40 w-full"
        onMouseLeave={() => setIndexSurvole(null)}
      >
        <line x1={MARGE} y1={HAUTEUR - MARGE} x2={LARGEUR - MARGE} y2={HAUTEUR - MARGE} className="stroke-creme-200" />
        <polyline
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
          fill="none"
          className="stroke-sarcelle-500"
          strokeWidth="2"
        />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={i === indexSurvole ? 4 : 2.5}
            className="fill-sarcelle-500"
            onMouseEnter={() => setIndexSurvole(i)}
            onClick={() => setIndexSurvole(i)}
          />
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {PERIODES.map((p) => (
          <button
            key={p.label}
            onClick={() => setPeriodeJours(p.valeur)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              periodeJours === p.valeur ? "bg-corail-500 text-white" : "bg-creme-200 text-charbon-600"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
