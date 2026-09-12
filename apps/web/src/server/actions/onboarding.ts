"use server";

import { calculerObjectifs, onboardingSchema, type ProfilPhysique } from "@assiettly/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/server/auth";

export interface OnboardingInput {
  objectifType: ProfilPhysique["objectifType"];
  sexe: ProfilPhysique["sexe"];
  dateNaissance: string;
  tailleCm: number;
  poidsKg: number;
  poidsCibleKg: number;
  niveauActivite: ProfilPhysique["niveauActivite"];
  frequenceSportParSemaine: number;
}

/**
 * Finalise l'onboarding : enregistre le profil physique, le premier poids
 * saisi, calcule et active l'objectif calorique, puis redirige vers le
 * paywall (essai gratuit avant le tableau de bord).
 */
export async function terminerOnboarding(input: OnboardingInput) {
  const data = onboardingSchema.parse(input);
  const profile = await requireProfile();

  const aujourdHui = new Date().toISOString().slice(0, 10);

  await prisma.$transaction([
    prisma.profile.update({
      where: { id: profile.id },
      data: {
        sexe: data.sexe,
        dateNaissance: new Date(data.dateNaissance),
        tailleCm: data.tailleCm,
        poidsCibleKg: data.poidsCibleKg,
        niveauActivite: data.niveauActivite,
        frequenceSportParSemaine: data.frequenceSportParSemaine,
        objectifType: data.objectifType,
        onboardingTermine: true,
      },
    }),
    prisma.weightLog.upsert({
      where: { profileId_date: { profileId: profile.id, date: new Date(aujourdHui) } },
      create: { profileId: profile.id, poidsKg: data.poidsKg, date: new Date(aujourdHui) },
      update: { poidsKg: data.poidsKg },
    }),
  ]);

  const objectifs = calculerObjectifs({
    sexe: data.sexe,
    dateNaissance: data.dateNaissance,
    tailleCm: data.tailleCm,
    poidsKg: data.poidsKg,
    niveauActivite: data.niveauActivite,
    objectifType: data.objectifType,
  });

  await prisma.$transaction(async (tx) => {
    await tx.goal.updateMany({ where: { profileId: profile.id, actif: true }, data: { actif: false } });
    await tx.goal.create({
      data: {
        profileId: profile.id,
        objectifCaloriesKcal: objectifs.caloriesKcal,
        objectifProteinesG: objectifs.proteinesG,
        objectifGlucidesG: objectifs.glucidesG,
        objectifLipidesG: objectifs.lipidesG,
      },
    });
  });

  revalidatePath("/", "layout");
  redirect("/paywall");
}
