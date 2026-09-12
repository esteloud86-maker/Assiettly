import Link from "next/link";
import { AnneauProgression } from "@/components/AnneauProgression";
import { BarreMacro } from "@/components/BarreMacro";
import { FlammeIcon } from "@/components/FlammeIcon";
import { obtenirRepasDuJour } from "@/server/actions/meals";
import { obtenirResumeStreak } from "@/server/actions/streaks";
import { requireProfile } from "@/server/auth";

export default async function AccueilPage() {
  const profile = await requireProfile();
  const goal = profile.goals[0];
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const [{ totaux }, streak] = await Promise.all([obtenirRepasDuJour(aujourdHui), obtenirResumeStreak()]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center rounded-2xl bg-creme-50 p-6 text-center shadow-sm">
        <FlammeIcon className="h-14 w-14" eteinte={streak.streakActuel === 0} />
        <p className="mt-1 font-titre text-4xl font-bold text-charbon-800">{streak.streakActuel}</p>
        <p className="text-charbon-400">{streak.streakActuel > 1 ? "jours de suite" : "jour"}</p>
        {streak.prochainPalier ? (
          <p className="mt-2 text-sm text-charbon-400">
            Encore {streak.prochainPalier - streak.streakActuel} jour(s) avant le badge{" "}
            {streak.prochainPalier} jours 🏅
          </p>
        ) : null}
        <p className="mt-1 text-sm text-sarcelle-500">
          ❄️ {streak.freezesRestantsCeMois} freeze(s) restant(s) ce mois-ci
        </p>
      </div>

      <div className="rounded-2xl bg-creme-50 p-6 shadow-sm">
        <h2 className="mb-4 font-titre text-lg font-semibold text-charbon-800">Aujourd&rsquo;hui</h2>
        {goal ? (
          <>
            <AnneauProgression caloriesConsommees={totaux.caloriesKcal} caloriesObjectif={goal.objectifCaloriesKcal} />
            <div className="mt-6 space-y-3">
              <BarreMacro
                label="Protéines"
                valeur={totaux.proteinesG}
                objectif={goal.objectifProteinesG}
                couleurClass="bg-corail-500"
              />
              <BarreMacro
                label="Glucides"
                valeur={totaux.glucidesG}
                objectif={goal.objectifGlucidesG}
                couleurClass="bg-sarcelle-500"
              />
              <BarreMacro
                label="Lipides"
                valeur={totaux.lipidesG}
                objectif={goal.objectifLipidesG}
                couleurClass="bg-ambre-500"
              />
            </div>
          </>
        ) : (
          <p className="text-charbon-400">Aucun objectif défini pour le moment.</p>
        )}
      </div>

      <Link
        href="/journal/ajouter"
        className="block rounded-2xl bg-corail-500 py-4 text-center font-titre font-semibold text-white shadow-sm transition-colors hover:bg-corail-600"
      >
        + Ajouter un repas
      </Link>
    </div>
  );
}
