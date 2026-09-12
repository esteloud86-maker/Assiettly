import { AnneauCirculaire } from "./primitives/AnneauCirculaire";

const INITIALES_JOURS = ["L", "M", "M", "J", "V", "S", "D"];

export function SelecteurJoursSemaine({
  jours,
}: {
  jours: {
    date: string;
    caloriesConsommees: number;
    objectifCalories: number | null;
    estAujourdHui: boolean;
    estFutur: boolean;
  }[];
}) {
  return (
    <div className="flex justify-between gap-1">
      {jours.map((jour, i) => (
        <div key={jour.date} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium text-charbon-400">{INITIALES_JOURS[i]}</span>
          <AnneauCirculaire
            valeur={jour.estFutur || !jour.objectifCalories ? 0 : jour.caloriesConsommees}
            max={jour.objectifCalories ?? 1}
            taille={36}
            epaisseur={4}
            couleurPleine={jour.estAujourdHui ? "#F2603C" : "#F2953C"}
            couleurFond={jour.estAujourdHui ? "#FFDCD0" : "#F5E6D8"}
            enfants={
              <span
                className={`text-[11px] font-semibold ${jour.estAujourdHui ? "text-corail-600" : "text-charbon-600"}`}
              >
                {Number(jour.date.slice(-2))}
              </span>
            }
          />
        </div>
      ))}
    </div>
  );
}
