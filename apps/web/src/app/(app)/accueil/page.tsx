import { CarteCaloriesJour } from "@/components/dashboard/CarteCaloriesJour";
import { CarteRepasRecent } from "@/components/dashboard/CarteRepasRecent";
import { CartesMacroPaginees } from "@/components/dashboard/CartesMacroPaginees";
import { EtatVide } from "@/components/dashboard/primitives/EtatVide";
import { SelecteurJoursSemaine } from "@/components/dashboard/SelecteurJoursSemaine";
import { obtenirRepasDuJour, obtenirSemaineDashboard } from "@/server/actions/meals";
import { requireProfile } from "@/server/auth";

// Apport en fibres usuellement recommandé par jour — sert uniquement à donner
// un repère visuel sur la carte "Fibres" (pas un objectif personnalisé).
const OBJECTIF_FIBRES_G = 25;

export default async function AccueilPage() {
  const profile = await requireProfile();
  const goal = profile.goals[0];
  const aujourdHui = new Date().toISOString().slice(0, 10);

  const [{ meals, totaux }, joursSemaine] = await Promise.all([
    obtenirRepasDuJour(aujourdHui),
    obtenirSemaineDashboard(),
  ]);

  // Heuristique simple : moyenne des ratios macro (plafonnés à 100 %) —
  // donne une idée d'ensemble de l'équilibre du jour, pas un score médical.
  const scoreSante = goal
    ? Math.round(
        (Math.min(1, totaux.proteinesG / goal.objectifProteinesG) +
          Math.min(1, totaux.glucidesG / goal.objectifGlucidesG) +
          Math.min(1, totaux.lipidesG / goal.objectifLipidesG)) *
          (100 / 3),
      )
    : 0;

  return (
    <div className="space-y-6">
      <SelecteurJoursSemaine jours={joursSemaine} />

      {goal ? (
        <>
          <CarteCaloriesJour caloriesConsommees={totaux.caloriesKcal} caloriesObjectif={goal.objectifCaloriesKcal} />

          <CartesMacroPaginees
            pages={[
              [
                { label: "Protéines", valeur: totaux.proteinesG, objectif: goal.objectifProteinesG, couleur: "#F2603C" },
                { label: "Glucides", valeur: totaux.glucidesG, objectif: goal.objectifGlucidesG, couleur: "#1F7A6C" },
                { label: "Lipides", valeur: totaux.lipidesG, objectif: goal.objectifLipidesG, couleur: "#F2953C" },
              ],
              [
                { label: "Fibres", valeur: totaux.fibresG, objectif: OBJECTIF_FIBRES_G, couleur: "#1F7A6C" },
                { label: "Score santé", valeur: scoreSante, objectif: 100, unite: "", couleur: "#F2603C" },
              ],
            ]}
          />
        </>
      ) : (
        <p className="rounded-2xl bg-creme-50 p-6 text-center text-charbon-400 shadow-sm">
          Aucun objectif défini pour le moment.
        </p>
      )}

      <div>
        <h2 className="mb-3 font-titre text-lg font-semibold text-charbon-800">Ajoutés récemment</h2>
        {meals.length === 0 ? (
          <EtatVide
            icone="🍽️"
            titre="Rien d'ajouté pour l'instant"
            message="Ajoute ton premier repas de la journée pour voir tes progrès se remplir."
            actionHref="/journal/ajouter"
            actionLabel="Ajouter un repas"
          />
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => {
              const premierNom = meal.items[0]?.food?.nom ?? meal.items[0]?.nomLibre ?? "Repas";
              const nomPrincipal =
                meal.items.length > 1 ? `${premierNom} + ${meal.items.length - 1} autre(s)` : premierNom;
              const totauxMeal = meal.items.reduce(
                (acc, item) => {
                  acc.caloriesKcal += Number(item.caloriesKcal);
                  acc.proteinesG += Number(item.proteinesG);
                  acc.glucidesG += Number(item.glucidesG);
                  acc.lipidesG += Number(item.lipidesG);
                  return acc;
                },
                { caloriesKcal: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0 },
              );
              return (
                <CarteRepasRecent
                  key={meal.id}
                  repas={{ id: meal.id, type: meal.type, createdAt: meal.createdAt, totaux: totauxMeal, nomPrincipal }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
