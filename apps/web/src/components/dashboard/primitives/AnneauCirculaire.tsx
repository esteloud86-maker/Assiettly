interface AnneauCirculaireProps {
  valeur: number;
  max: number;
  taille?: number;
  epaisseur?: number;
  degrade?: [string, string];
  couleurPleine?: string;
  couleurFond?: string;
  enfants?: React.ReactNode;
}

/**
 * Anneau de progression SVG générique et paramétrable, réutilisé pour tous
 * les indicateurs circulaires du dashboard (calories, macros, mini-anneaux
 * jour par jour).
 */
export function AnneauCirculaire({
  valeur,
  max,
  taille = 120,
  epaisseur = 12,
  degrade,
  couleurPleine = "#F2603C",
  couleurFond = "#F5E6D8",
  enfants,
}: AnneauCirculaireProps) {
  const rayon = taille / 2 - epaisseur / 2 - 2;
  const circonference = 2 * Math.PI * rayon;
  const pct = max > 0 ? Math.min(1, Math.max(0, valeur / max)) : 0;
  const offset = circonference * (1 - pct);
  const id = `anneau-degrade-${degrade?.[0]?.replace("#", "") ?? "solide"}`;

  return (
    <div className="relative" style={{ width: taille, height: taille }}>
      <svg viewBox={`0 0 ${taille} ${taille}`} className="h-full w-full -rotate-90">
        {degrade ? (
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={degrade[0]} />
              <stop offset="100%" stopColor={degrade[1]} />
            </linearGradient>
          </defs>
        ) : null}
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          strokeWidth={epaisseur}
          fill="none"
          stroke={couleurFond}
        />
        <circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          strokeWidth={epaisseur}
          fill="none"
          strokeLinecap="round"
          stroke={degrade ? `url(#${id})` : couleurPleine}
          strokeDasharray={circonference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {enfants ? <div className="absolute inset-0 flex flex-col items-center justify-center">{enfants}</div> : null}
    </div>
  );
}
