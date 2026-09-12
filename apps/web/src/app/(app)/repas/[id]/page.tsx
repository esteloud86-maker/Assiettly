import Link from "next/link";
import { notFound } from "next/navigation";
import { AjusteurQuantiteRepas } from "@/components/dashboard/AjusteurQuantiteRepas";
import { BoutonPartager } from "@/components/dashboard/BoutonPartager";
import { CartesMacroPaginees } from "@/components/dashboard/CartesMacroPaginees";
import { MenuRepas } from "@/components/dashboard/MenuRepas";
import { obtenirRepasParId } from "@/server/actions/meals";
import { requireProfile } from "@/server/auth";

const LIBELLES_TYPE: Record<string, string> = {
  PETIT_DEJ: "Petit-déjeuner",
  DEJEUNER: "Déjeuner",
  DINER: "Dîner",
  COLLATION: "Collation",
};

const OBJECTIF_FIBRES_G = 25;

export default async function DetailRepasPage({ params }: { params: { id: string } }) {
  const profile = await requireProfile();
  const meal = await obtenirRepasParId(params.id);
  if (!meal) notFound();

  const goal = profile.goals[0];
  const totaux = meal.items.reduce(
    (acc, item) => {
      acc.caloriesKcal += Number(item.caloriesKcal);
      acc.proteinesG += Number(item.proteinesG);
      acc.glucidesG += Number(item.glucidesG);
      acc.lipidesG += Number(item.lipidesG);
      acc.fibresG += Number(item.fibresG ?? 0);
      acc.quantiteG += Number(item.quantiteG);
      return acc;
    },
    { caloriesKcal: 0, proteinesG: 0, glucidesG: 0, lipidesG: 0, fibresG: 0, quantiteG: 0 },
  );

  const premierNom = meal.items[0]?.food?.nom ?? meal.items[0]?.nomLibre ?? "Repas";
  const nomPrincipal = meal.items.length > 1 ? `${premierNom} + ${meal.items.length - 1} autre(s)` : premierNom;
  const horodatage = meal.createdAt.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="-mx-4 -mt-6 space-y-6 sm:-mx-6">
      <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-corail-400 to-ambre-500 text-6xl">
        🍽️
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-base">
          <Link
            href="/accueil"
            aria-label="Retour"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-creme-50/90 text-charbon-800 shadow-sm"
          >
            ←
          </Link>
          <span className="font-titre text-lg font-semibold text-white drop-shadow">Nutrition</span>
          <div className="flex items-center gap-2">
            <BoutonPartager titre={nomPrincipal} />
            <MenuRepas mealId={meal.id} />
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-titre text-xl font-semibold text-charbon-800">{nomPrincipal}</h1>
            <p className="text-sm text-charbon-400">
              {LIBELLES_TYPE[meal.type] ?? meal.type} · {horodatage}
            </p>
          </div>
          <AjusteurQuantiteRepas mealId={meal.id} totalGrammes={totaux.quantiteG} />
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-creme-50 p-5 shadow-sm">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="font-titre text-3xl font-bold text-charbon-800">{Math.round(totaux.caloriesKcal)}</p>
            <p className="text-sm text-charbon-400">calories</p>
          </div>
        </div>

        <CartesMacroPaginees
          pages={[
            [
              { label: "Protéines", valeur: totaux.proteinesG, objectif: goal?.objectifProteinesG ?? 1, couleur: "#F2603C" },
              { label: "Glucides", valeur: totaux.glucidesG, objectif: goal?.objectifGlucidesG ?? 1, couleur: "#1F7A6C" },
              { label: "Lipides", valeur: totaux.lipidesG, objectif: goal?.objectifLipidesG ?? 1, couleur: "#F2953C" },
            ],
            [{ label: "Fibres", valeur: totaux.fibresG, objectif: OBJECTIF_FIBRES_G, couleur: "#1F7A6C" }],
          ]}
        />

        <div>
          <h2 className="mb-3 font-titre font-semibold text-charbon-800">Ingrédients détectés</h2>
          <div className="space-y-2">
            {meal.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-creme-50 p-3 shadow-sm">
                <div>
                  <p className="font-medium text-charbon-800">{item.food?.nom ?? item.nomLibre}</p>
                  <p className="text-xs text-charbon-400">{Math.round(Number(item.quantiteG))} g</p>
                </div>
                <span className="text-sm font-semibold text-charbon-800">
                  {Math.round(Number(item.caloriesKcal))} kcal
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/journal/ajouter"
            className="mt-2 block text-center text-sm font-medium text-corail-600 hover:underline"
          >
            + Ajouter un aliment
          </Link>
        </div>

        <div className="flex gap-3 pb-4">
          <button
            disabled
            title="Bientôt disponible : correction assistée par IA"
            className="flex-1 rounded-2xl bg-creme-200 py-3.5 font-titre font-semibold text-charbon-400"
          >
            Corriger
          </button>
          <Link
            href="/accueil"
            className="flex-1 rounded-2xl bg-charbon-800 py-3.5 text-center font-titre font-semibold text-white"
          >
            Terminé
          </Link>
        </div>
      </div>
    </div>
  );
}
