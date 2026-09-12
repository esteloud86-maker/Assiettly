"use server";

import { FREEZES_MAX_PAR_MOIS, freezeStreakSchema, palierAtteint, prochainPalier } from "@assiettly/shared";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/server/auth";
import { geler } from "@/server/streak";

export async function obtenirResumeStreak() {
  const profile = await requireProfile();
  const summary = await prisma.streakSummary.findUnique({ where: { profileId: profile.id } });
  const streakActuel = summary?.streakActuel ?? 0;

  const now = new Date();
  const memeMois =
    summary?.moisReferenceFreeze &&
    summary.moisReferenceFreeze.getUTCFullYear() === now.getUTCFullYear() &&
    summary.moisReferenceFreeze.getUTCMonth() === now.getUTCMonth();

  return {
    streakActuel,
    streakMax: summary?.streakMax ?? 0,
    dernierJourFlamme: summary?.dernierJourFlamme ?? null,
    freezesRestantsCeMois: FREEZES_MAX_PAR_MOIS - (memeMois ? (summary?.freezesUtilisesMois ?? 0) : 0),
    palierAtteint: palierAtteint(streakActuel),
    prochainPalier: prochainPalier(streakActuel),
  };
}

export async function obtenirCalendrierStreak(debut: string, fin: string) {
  const profile = await requireProfile();
  return prisma.streakDay.findMany({
    where: { profileId: profile.id, date: { gte: new Date(debut), lte: new Date(fin) } },
    orderBy: { date: "asc" },
  });
}

export async function gelerJour(date: string) {
  const data = freezeStreakSchema.parse({ date });
  const profile = await requireProfile();
  const resultat = await geler(profile.id, new Date(data.date));

  revalidatePath("/streaks/calendrier");
  revalidatePath("/accueil");

  return resultat;
}
