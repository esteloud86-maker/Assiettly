import Link from "next/link";
import { obtenirRepasDuJour, supprimerRepas } from "@/server/actions/meals";

const LIBELLES_TYPE: Record<string, string> = {
  PETIT_DEJ: "Petit-déjeuner",
  DEJEUNER: "Déjeuner",
  DINER: "Dîner",
  COLLATION: "Collation",
};

export default async function JournalPage() {
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const { meals, totaux } = await obtenirRepasDuJour(aujourdHui);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-titre text-2xl font-semibold text-charbon-800">Journal du jour</h1>
        <p className="text-charbon-400">{Math.round(totaux.caloriesKcal)} kcal enregistrées</p>
      </div>

      {meals.length === 0 ? (
        <p className="text-charbon-400">Aucun repas ajouté pour l&rsquo;instant.</p>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <div key={meal.id} className="rounded-2xl bg-creme-50 p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-titre font-semibold text-charbon-800">
                  {LIBELLES_TYPE[meal.type] ?? meal.type}
                </span>
                <form action={async () => { "use server"; await supprimerRepas(meal.id); }}>
                  <button type="submit" className="text-sm text-corail-600 hover:underline">
                    Supprimer
                  </button>
                </form>
              </div>
              <ul className="space-y-1 text-sm text-charbon-600">
                {meal.items.map((item) => (
                  <li key={item.id}>
                    • {item.food?.nom ?? item.nomLibre} ({Number(item.quantiteG)} g) —{" "}
                    {Math.round(Number(item.caloriesKcal))} kcal
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/journal/ajouter"
        className="block rounded-2xl bg-corail-500 py-4 text-center font-titre font-semibold text-white shadow-sm hover:bg-corail-600"
      >
        + Ajouter un repas
      </Link>
    </div>
  );
}
