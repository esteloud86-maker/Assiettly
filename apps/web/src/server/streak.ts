import { calculerStreakSummary, evaluerObjectifJour, type JourStreak } from "@assiettly/shared";
import { Prisma, type StreakSummary } from "@prisma/client";
import { aujourdHuiLocalCommeDate } from "@/lib/date";
import { FREEZES_GRATUIT_PAR_MOIS } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

type Db = typeof prisma | Prisma.TransactionClient;

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Recalcule le jour de streak (flamme allumée ou non) pour une date donnée,
 * à partir des repas déjà ajoutés ce jour-là, puis met à jour le résumé de
 * streak du profil (streak actuel / max). À appeler après chaque
 * création/suppression de repas.
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
  const aAuMoinsUnRepasAjoute = meals.length > 0;

  const objectifRespecte = goal
    ? evaluerObjectifJour({
        caloriesJour,
        objectifCaloriesKcal: goal.objectifCaloriesKcal,
        tolerancePct: goal.tolerancePct,
        aAuMoinsUnRepasAjoute,
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

async function recalculerResumeStreak(profileId: string, db: Db = prisma): Promise<void> {
  const jours = await db.streakDay.findMany({
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

  await db.streakSummary.upsert({
    where: { profileId },
    create: { profileId, streakActuel, streakMax, dernierJourFlamme },
    update: { streakActuel, streakMax, dernierJourFlamme },
  });
}

/**
 * Utilise un freeze pour geler un jour manqué (max `freezesMax` par mois
 * calendaire — 2 en gratuit, 5 en Premium, cf. `lib/pricing.ts`
 * `freezesMaxParMois()` ; l'appelant calcule la valeur à partir du statut
 * réel du profil, cette fonction ne connaît que le nombre, jamais le
 * statut — la vérification Premium doit rester faite une seule fois, côté
 * serveur, par `estPremium()`).
 *
 * Tout le "lire le compteur de freezes du mois → vérifier la limite →
 * l'incrémenter" est exécuté dans une transaction SERIALIZABLE : sans ça,
 * deux appels concurrents (double-tap, deux onglets) peuvent tous les deux
 * lire le même `freezesUtilisesMois`, passer la vérification de limite, puis
 * écraser l'incrément l'un de l'autre (lost update) — ce qui permet de
 * dépasser la limite mensuelle de freezes. Sous SERIALIZABLE, Postgres fait
 * plutôt échouer l'une des deux transactions (erreur Prisma P2034).
 */
export async function geler(
  profileId: string,
  date: Date,
  freezesMax: number,
): Promise<{ ok: true } | { ok: false; raison: string }> {
  const debutJour = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const moisReference = new Date(Date.UTC(debutJour.getUTCFullYear(), debutJour.getUTCMonth(), 1));

  try {
    return await prisma.$transaction(
      async (tx) => {
        const existant = await tx.streakDay.findUnique({
          where: { profileId_date: { profileId, date: debutJour } },
        });
        if (existant?.flammeAllumee) {
          return { ok: false, raison: "Ce jour a déjà une flamme, inutile de le geler." };
        }

        const summary = await tx.streakSummary.findUnique({ where: { profileId } });
        const memeMois =
          summary?.moisReferenceFreeze &&
          summary.moisReferenceFreeze.getUTCFullYear() === moisReference.getUTCFullYear() &&
          summary.moisReferenceFreeze.getUTCMonth() === moisReference.getUTCMonth();
        const freezesUtilisesCeMois = memeMois ? (summary?.freezesUtilisesMois ?? 0) : 0;

        if (freezesUtilisesCeMois >= freezesMax) {
          return { ok: false, raison: `Limite de ${freezesMax} freezes par mois atteinte.` };
        }

        await tx.streakDay.upsert({
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

        await tx.streakSummary.upsert({
          where: { profileId },
          create: { profileId, freezesUtilisesMois: 1, moisReferenceFreeze: moisReference },
          update: { freezesUtilisesMois: freezesUtilisesCeMois + 1, moisReferenceFreeze: moisReference },
        });

        await recalculerResumeStreak(profileId, tx);
        return { ok: true };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (erreur) {
    if (erreur instanceof Prisma.PrismaClientKnownRequestError && erreur.code === "P2034") {
      return { ok: false, raison: "Une autre action est en cours, réessaie." };
    }
    throw erreur;
  }
}

/**
 * Détecte le déclencheur de paywall contextuel "flamme perdue qu'un gel
 * Premium aurait sauvée" (cf. brief viralité) : la flamme vient de s'éteindre
 * (pas une perte ancienne), ET les gels gratuits du mois étaient déjà tous
 * utilisés au moment de la perte — donc un gel supplémentaire (réservé
 * Premium) aurait vraiment pu la sauver. Jamais affiché si l'un des deux
 * n'est pas vrai : pas de fausse urgence.
 */
export function flammeVientDetreCasseeSansGel(summary: StreakSummary | null): boolean {
  if (!summary || summary.streakActuel !== 0 || !summary.dernierJourFlamme) return false;

  const aujourdHui = aujourdHuiLocalCommeDate();
  const avantHier = new Date(aujourdHui);
  avantHier.setUTCDate(avantHier.getUTCDate() - 2);
  const perteRecente = summary.dernierJourFlamme.getTime() >= avantHier.getTime();
  if (!perteRecente) return false;

  const memeMois =
    summary.moisReferenceFreeze &&
    summary.moisReferenceFreeze.getUTCFullYear() === aujourdHui.getUTCFullYear() &&
    summary.moisReferenceFreeze.getUTCMonth() === aujourdHui.getUTCMonth();

  return !!memeMois && summary.freezesUtilisesMois >= FREEZES_GRATUIT_PAR_MOIS;
}
