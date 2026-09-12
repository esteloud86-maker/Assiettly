import { AnneauCirculaire } from "./primitives/AnneauCirculaire";

export function CarteCaloriesJour({
  caloriesConsommees,
  caloriesObjectif,
}: {
  caloriesConsommees: number;
  caloriesObjectif: number;
}) {
  const restantes = Math.max(0, Math.round(caloriesObjectif - caloriesConsommees));

  return (
    <div className="flex flex-col items-center rounded-2xl bg-creme-50 p-6 shadow-sm">
      <AnneauCirculaire
        valeur={caloriesConsommees}
        max={caloriesObjectif}
        taille={200}
        epaisseur={16}
        degrade={["#F2603C", "#F2953C"]}
        enfants={
          <>
            <span className="font-titre text-4xl font-bold text-charbon-800">{Math.round(caloriesConsommees)}</span>
            <span className="text-sm text-charbon-400">/ {Math.round(caloriesObjectif)} kcal</span>
            <span className="mt-1 text-xs text-sarcelle-500">{restantes} kcal restantes</span>
          </>
        }
      />
    </div>
  );
}
