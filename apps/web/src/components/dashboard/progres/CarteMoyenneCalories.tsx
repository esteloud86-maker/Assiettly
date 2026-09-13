export function CarteMoyenneCalories({
  moyenneActuelle,
  variationPct,
}: {
  moyenneActuelle: number;
  variationPct: number | null;
}) {
  const enHausse = variationPct !== null && variationPct > 0;
  const stable = variationPct === null || variationPct === 0;

  return (
    <div className="rounded-2xl bg-creme-50 p-4 shadow-sm">
      <p className="text-xs font-medium text-charbon-400">Moyenne quotidienne de calories</p>
      <div className="mt-1 flex items-center justify-between">
        <p className="font-titre text-2xl font-bold text-charbon-800">{moyenneActuelle} kcal</p>
        {!stable ? (
          <span className={`text-sm font-semibold ${enHausse ? "text-corail-600" : "text-sarcelle-500"}`}>
            {enHausse ? "▲" : "▼"} {Math.abs(variationPct!)}%
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-charbon-400">par rapport aux 7 jours précédents</p>
    </div>
  );
}
