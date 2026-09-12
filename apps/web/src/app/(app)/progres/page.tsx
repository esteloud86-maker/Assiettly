import { CalendrierMensuel } from "@/components/dashboard/progres/CalendrierMensuel";
import { CarteMoyenneCalories } from "@/components/dashboard/progres/CarteMoyenneCalories";
import { CartePoidsActuel } from "@/components/dashboard/progres/CartePoidsActuel";
import { CarteSerieProgres } from "@/components/dashboard/progres/CarteSerieProgres";
import { GraphiqueEvolutionPoids } from "@/components/dashboard/progres/GraphiqueEvolutionPoids";
import { MessageEncouragement, type TendancePoids } from "@/components/dashboard/progres/MessageEncouragement";
import { obtenirTendanceCalories } from "@/server/actions/meals";
import { requireProfile } from "@/server/auth";
import { obtenirCalendrierStreak, obtenirResumeStreak } from "@/server/actions/streaks";
import { obtenirHistoriquePoids } from "@/server/actions/weight";

function calculerTendance(
  logs: { poidsKg: number }[],
  objectifType: string | null,
): TendancePoids {
  if (logs.length < 3) return "pas_assez_de_donnees";

  const fenetre = logs.slice(Math.max(0, logs.length - 5));
  const delta = fenetre.at(-1)!.poidsKg - fenetre[0].poidsKg;

  if (objectifType === "MAINTIEN" || !objectifType) {
    return Math.abs(delta) < 1 ? "stable_maintien" : "ralentissement";
  }
  const directionAttendue = objectifType === "PERTE" ? -1 : 1;
  const vaDansLeBonSens = Math.sign(delta) === directionAttendue;
  return vaDansLeBonSens && Math.abs(delta) >= 0.3 ? "progression_stable" : "ralentissement";
}

export default async function ProgresPage() {
  const profile = await requireProfile();

  const aujourdHui = new Date();
  const ilYA6Jours = new Date(aujourdHui);
  ilYA6Jours.setUTCDate(ilYA6Jours.getUTCDate() - 6);

  const [logs, streak, joursSemaine, tendanceCalories] = await Promise.all([
    obtenirHistoriquePoids(),
    obtenirResumeStreak(),
    obtenirCalendrierStreak(ilYA6Jours.toISOString().slice(0, 10), aujourdHui.toISOString().slice(0, 10)),
    obtenirTendanceCalories(7),
  ]);

  const points = logs.map((l) => ({ date: l.date.toISOString(), poidsKg: Number(l.poidsKg) }));
  const poidsActuel = points.at(-1)?.poidsKg ?? null;
  const poidsInitial = points[0]?.poidsKg ?? null;
  const poidsCible = profile.poidsCibleKg ? Number(profile.poidsCibleKg) : null;

  const parDate = new Map(joursSemaine.map((j) => [j.date.toISOString().slice(0, 10), j]));
  const cleAujourdHui = aujourdHui.toISOString().slice(0, 10);
  const semaine = Array.from({ length: 7 }, (_, i) => {
    const jour = new Date(ilYA6Jours);
    jour.setUTCDate(jour.getUTCDate() + i);
    const cle = jour.toISOString().slice(0, 10);
    return { estAujourdHui: cle === cleAujourdHui, reussi: parDate.get(cle)?.flammeAllumee ?? false };
  });

  const tendance = calculerTendance(
    points.map((p) => ({ poidsKg: p.poidsKg })),
    profile.objectifType,
  );

  return (
    <div className="space-y-6">
      <h1 className="font-titre text-2xl font-semibold text-charbon-800">Progrès</h1>

      <div className="grid grid-cols-2 gap-3">
        <CartePoidsActuel poidsActuelKg={poidsActuel} poidsCibleKg={poidsCible} poidsInitialKg={poidsInitial} />
        <CarteSerieProgres streakActuel={streak.streakActuel} semaine={semaine} />
      </div>

      <GraphiqueEvolutionPoids points={points} poidsCibleKg={poidsCible} />

      <MessageEncouragement tendance={tendance} />

      <CarteMoyenneCalories moyenneActuelle={tendanceCalories.moyenneActuelle} variationPct={tendanceCalories.variationPct} />

      <CalendrierMensuel />
    </div>
  );
}
