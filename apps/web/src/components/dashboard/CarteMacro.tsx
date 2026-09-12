import { AnneauCirculaire } from "./primitives/AnneauCirculaire";

export function CarteMacro({
  label,
  valeur,
  objectif,
  unite = "g",
  couleur,
}: {
  label: string;
  valeur: number;
  objectif: number;
  unite?: string;
  couleur: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-creme-50 p-4 shadow-sm">
      <AnneauCirculaire
        valeur={valeur}
        max={objectif}
        taille={64}
        epaisseur={7}
        couleurPleine={couleur}
        enfants={<span className="text-xs font-semibold text-charbon-800">{Math.round((objectif > 0 ? valeur / objectif : 0) * 100)}%</span>}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-charbon-400">{label}</p>
        <p className="text-sm font-semibold text-charbon-800">
          {Math.round(valeur)}
          <span className="text-charbon-400">/{Math.round(objectif)}{unite}</span>
        </p>
      </div>
    </div>
  );
}
