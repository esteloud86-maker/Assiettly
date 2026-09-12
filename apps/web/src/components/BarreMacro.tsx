export function BarreMacro({
  label,
  valeur,
  objectif,
  couleurClass,
}: {
  label: string;
  valeur: number;
  objectif: number;
  couleurClass: string;
}) {
  const pct = objectif > 0 ? Math.min(100, (valeur / objectif) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-charbon-600">{label}</span>
        <span className="text-charbon-400">
          {Math.round(valeur)} / {Math.round(objectif)} g
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-creme-200">
        <div className={`h-full rounded-full ${couleurClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
