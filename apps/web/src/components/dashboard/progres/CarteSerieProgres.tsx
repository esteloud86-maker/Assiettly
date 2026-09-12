import { FlammeIcon } from "@/components/FlammeIcon";

const INITIALES_JOURS = ["L", "M", "M", "J", "V", "S", "D"];

export function CarteSerieProgres({
  streakActuel,
  semaine,
}: {
  streakActuel: number;
  semaine: { estAujourdHui: boolean; reussi: boolean }[];
}) {
  return (
    <div className="rounded-2xl bg-creme-50 p-4 shadow-sm">
      <p className="text-xs font-medium text-charbon-400">Série</p>
      <div className="mt-1 flex items-center gap-2">
        <FlammeIcon className="h-8 w-8" eteinte={streakActuel === 0} />
        <span className="font-titre text-2xl font-bold text-charbon-800">{streakActuel}</span>
      </div>
      <div className="mt-3 flex justify-between">
        {semaine.map((jour, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium text-charbon-400">{INITIALES_JOURS[i]}</span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                jour.reussi
                  ? "bg-corail-500 text-white"
                  : jour.estAujourdHui
                    ? "bg-creme-200 text-charbon-600 ring-1 ring-ambre-500"
                    : "bg-creme-200 text-charbon-400"
              }`}
            >
              {jour.reussi ? "✓" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
