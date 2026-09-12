const RAYON = 52;
const CIRCONFERENCE = 2 * Math.PI * RAYON;

export function AnneauProgression({
  caloriesConsommees,
  caloriesObjectif,
}: {
  caloriesConsommees: number;
  caloriesObjectif: number;
}) {
  const pct = caloriesObjectif > 0 ? Math.min(1, caloriesConsommees / caloriesObjectif) : 0;
  const offset = CIRCONFERENCE * (1 - pct);
  const restantes = Math.max(0, Math.round(caloriesObjectif - caloriesConsommees));

  return (
    <div className="relative mx-auto h-56 w-56">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={RAYON} strokeWidth="12" className="stroke-creme-200" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={RAYON}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          className="stroke-corail-500 transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={CIRCONFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-titre text-3xl font-semibold text-charbon-800">{restantes}</span>
        <span className="text-sm text-charbon-400">kcal restantes</span>
      </div>
    </div>
  );
}
