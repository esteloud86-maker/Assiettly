interface Point {
  date: string;
  poidsKg: number;
}

const LARGEUR = 100;
const HAUTEUR = 40;
const MARGE = 6;

export function GraphiquePoids({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-center text-charbon-400">
        Ajoute au moins deux pesées pour voir ta tendance.
      </div>
    );
  }

  const poids = points.map((p) => p.poidsKg);
  const min = Math.min(...poids);
  const max = Math.max(...poids);
  const echelle = max - min || 1;

  const coords = points.map((p, i) => {
    const x = MARGE + (i / (points.length - 1)) * (LARGEUR - 2 * MARGE);
    const y = HAUTEUR - MARGE - ((p.poidsKg - min) / echelle) * (HAUTEUR - 2 * MARGE);
    return { x, y };
  });

  return (
    <div>
      <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} className="h-40 w-full">
        <line x1={MARGE} y1={HAUTEUR - MARGE} x2={LARGEUR - MARGE} y2={HAUTEUR - MARGE} className="stroke-creme-200" />
        <polyline
          points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
          fill="none"
          className="stroke-corail-500"
          strokeWidth="1"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1.2" className="fill-corail-500" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-charbon-400">
        <span>{points[0].poidsKg} kg</span>
        <span>{points.at(-1)!.poidsKg} kg</span>
      </div>
    </div>
  );
}
