"use server";

import { render } from "@react-email/render";
import { calculerObjectifs, onboardingSchema, type ProfilPhysique } from "@assiettly/shared";
import type { Frein, MotivationPrincipale, TypeAlimentation } from "@assiettly/shared";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Bienvenue } from "../../../emails/Bienvenue";
import { prisma } from "@/lib/prisma";
import { RESEND_FROM_EMAIL, resend } from "@/lib/resend";
import { requireProfile } from "@/server/auth";

export interface OnboardingInput {
  sexe: ProfilPhysique["sexe"];
  dateNaissance: string;
  niveauActivite: ProfilPhysique["niveauActivite"];
  tailleCm: number;
  poidsKg: number;
  dejaUtiliseAppSuivi: boolean;
  suiviParCoach: boolean;
  objectifType: ProfilPhysique["objectifType"];
  freins: Frein[];
  poidsCibleKg: number;
  typeAlimentation: TypeAlimentation;
  motivationPrincipale: MotivationPrincipale;
}

/**
 * Finalise l'onboarding : enregistre le profil physique et les réponses du
 * questionnaire, le premier poids saisi, calcule et active l'objectif
 * calorique, puis redirige vers le paywall (essai gratuit avant le
 * tableau de bord).
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
        objectifType: data.objectifType,
        dejaUtiliseAppSuivi: data.dejaUtiliseAppSuivi,
        suiviParCoach: data.suiviParCoach,
        freins: data.freins,
        typeAlimentation: data.typeAlimentation,
        motivationPrincipale: data.motivationPrincipale,
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

  // Best-effort : un échec d'envoi ne doit jamais bloquer la fin de
  // l'onboarding (ex. clé Resend absente en local, domaine pas encore
  // vérifié). `onboardingTermine` ne passe à `true` qu'une seule fois par
  // profil, donc ce point d'appel n'envoie l'e-mail de bienvenue qu'une
  // seule fois par utilisateur.
  try {
    const html = await render(Bienvenue({ prenom: profile.nom }));
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: profile.email,
      subject: "Bienvenue sur Assiettly 🎉",
      html,
    });
  } catch (err) {
    console.error("Échec de l'envoi de l'e-mail de bienvenue :", err);
  }

  revalidatePath("/", "layout");
  redirect("/paywall");
}
