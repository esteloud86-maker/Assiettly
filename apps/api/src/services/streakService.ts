import {
  calculerStreakSummary,
  evaluerObjectifJour,
  FREEZES_MAX_PAR_MOIS,
  type JourStreak,
} from "@assiettly/shared";
import { prisma } from "../lib/prisma";

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Recalcule le jour de streak (flamme allumée ou non) pour une date donnée,
 * à partir des repas déjà loggés ce jour-là, puis met à jour le résumé de
 * streak du profil (streak actuel / max).
 *
 * À appeler après chaque création/suppression de repas.
 */
export async function recomputerStreakPourJour(profileId: string, date: Date): Promise<void> {
  const goal = await prisma.goal.findFirst({
    where: { profileId, actif: true },
    orderBy: { actifDepuis: "desc" },
  });

  const debutJour = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const finJour = new Date(debutJour);
  finJour.setUTCDate(finJour.getUTCDate() + 1);

  const meals = await prisma.meal.findMany({
    where: { profileId, date: { gte: debutJour, lt: finJour } },
    include: { items: true },
  });

  const caloriesJour = meals.reduce(
    (total, meal) => total + meal.items.reduce((s, item) => s + Number(item.caloriesKcal), 0),
    0,
  );
  const aAuMoinsUnRepasLogge = meals.length > 0;

  const objectifRespecte = goal
    ? evaluerObjectifJour({
        caloriesJour,
        objectifCaloriesKcal: goal.objectifCaloriesKcal,
        tolerancePct: goal.tolerancePct,
        aAuMoinsUnRepasLogge,
      })
    : false;

  await prisma.streakDay.upsert({
    where: { profileId_date: { profileId, date: debutJour } },
    create: {
      profileId,
      date: debutJour,
      caloriesJour: Math.round(caloriesJour),
      objectifRespecte,
      flammeAllumee: objectifRespecte,
    },
    update: {
      caloriesJour: Math.round(caloriesJour),
      objectifRespecte,
      flammeAllumee: objectifRespecte,
    },
  });

  await recalculerResumeStreak(profileId);
}

/** Reconstruit le résumé (streak actuel / max) à partir de l'historique complet. */
async function recalculerResumeStreak(profileId: string): Promise<void> {
  const jours = await prisma.streakDay.findMany({
    where: { profileId, OR: [{ flammeAllumee: true }, { freezeUtilise: true }] },
    orderBy: { date: "asc" },
  });

  const joursCalcul: JourStreak[] = jours.map((j) => ({
    date: toDateOnly(j.date),
    flammeAllumee: j.flammeAllumee,
    freezeUtilise: j.freezeUtilise,
  }));

  const { streakActuel, streakMax } = calculerStreakSummary(joursCalcul);

  const dernierJourFlamme = [...jours].reverse().find((j) => j.flammeAllumee)?.date ?? null;

  await prisma.streakSummary.upsert({
    where: { profileId },
    create: { profileId, streakActuel, streakMax, dernierJourFlamme },
    update: { streakActuel, streakMax, dernierJourFlamme },
  });
}

/**
 * Utilise un freeze pour geler un jour manqué (max 2 par mois calendaire).
 * Le jour doit être dans le passé et ne doit pas déjà avoir une flamme.
 */
export async function geler(profileId: string, date: Date): Promise<{ ok: true } | { ok: false; raison: string }> {
  const debutJour = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const moisReference = new Date(Date.UTC(debutJour.getUTCFullYear(), debutJour.getUTCMonth(), 1));

  const existant = await prisma.streakDay.findUnique({
    where: { profileId_date: { profileId, date: debutJour } },
  });
  if (existant?.flammeAllumee) {
    return { ok: false, raison: "Ce jour a déjà une flamme, inutile de le geler." };
  }

  const summary = await prisma.streakSummary.findUnique({ where: { profileId } });
  const memeMois =
    summary?.moisReferenceFreeze &&
    summary.moisReferenceFreeze.getUTCFullYear() === moisReference.getUTCFullYear() &&
    summary.moisReferenceFreeze.getUTCMonth() === moisReference.getUTCMonth();
  const freezesUtilisesCeMois = memeMois ? (summary?.freezesUtilisesMois ?? 0) : 0;

  if (freezesUtilisesCeMois >= FREEZES_MAX_PAR_MOIS) {
    return { ok: false, raison: `Limite de ${FREEZES_MAX_PAR_MOIS} freezes par mois atteinte.` };
  }

  await prisma.streakDay.upsert({
    where: { profileId_date: { profileId, date: debutJour } },
    create: {
      profileId,
      date: debutJour,
      caloriesJour: existant?.caloriesJour ?? 0,
      objectifRespecte: false,
      flammeAllumee: false,
      freezeUtilise: true,
    },
    update: { freezeUtilise: true },
  });

  await prisma.streakSummary.upsert({
    where: { profileId },
    create: {
      profileId,
      freezesUtilisesMois: 1,
      moisReferenceFreeze: moisReference,
    },
    update: {
      freezesUtilisesMois: freezesUtilisesCeMois + 1,
      moisReferenceFreeze: moisReference,
    },
  });

  await recalculerResumeStreak(profileId);
  return { ok: true };
}
