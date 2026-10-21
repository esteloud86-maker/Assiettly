"use server";

import { prisma } from "@/lib/prisma";
import { PARRAINAGE_MOIS_OFFERTS, PARRAINAGE_PLAFOND_PAR_PARRAIN, PARRAINAGE_REPAS_REQUIS } from "@/lib/pricing";
import { requireProfile } from "@/server/auth";

/** Lien personnel de parrainage de l'utilisateur courant, pour l'écran "Invite un ami". */
export async function obtenirLienParrainage() {
  const profile = await requireProfile();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  const [moisGagnes, filleulsEnAttente] = await Promise.all([
    prisma.parrainage.count({ where: { parrainId: profile.id, recompenseAccordee: true } }),
    prisma.parrainage.count({ where: { parrainId: profile.id, valide: false } }),
  ]);

  return {
    code: profile.codeParrainage,
    url: profile.codeParrainage ? `${appUrl}/inscription?ref=${profile.codeParrainage}` : null,
    moisGagnes,
    filleulsEnAttente,
  };
}

/**
 * Accorde `PARRAINAGE_MOIS_OFFERTS` mois de Premium à un profil, au niveau
 * base de données (pas un vrai abonnement Stripe) : `estPremium()` ne lit
 * que `Subscription.status`/`trialEndsAt` en base, donc ça débloque
 * réellement les fonctionnalités Premium. Si le profil a déjà un
 * abonnement/essai en cours, la récompense prolonge la date de fin au lieu
 * de l'écraser. Si l'utilisateur s'abonne plus tard pour de vrai via
 * Stripe, le webhook `customer.subscription.*` réécrit cette ligne sans
 * conflit (upsert sur `profileId`).
 */
async function accorderMoisPremium(profileId: string): Promise<void> {
  const existant = await prisma.subscription.findUnique({ where: { profileId } });
  const maintenant = new Date();
  const base =
    existant?.status === "TRIALING" && existant.trialEndsAt && existant.trialEndsAt.getTime() > maintenant.getTime()
      ? existant.trialEndsAt
      : maintenant;
  const nouvelleFin = new Date(base);
  nouvelleFin.setUTCMonth(nouvelleFin.getUTCMonth() + PARRAINAGE_MOIS_OFFERTS);

  await prisma.subscription.upsert({
    where: { profileId },
    create: { profileId, status: "TRIALING", trialEndsAt: nouvelleFin },
    update:
      // Un abonnement payant actif n'a pas besoin qu'on le "prolonge" au
      // niveau base — ce serait trompeur (la vraie date de fin vit chez
      // Stripe). La récompense ne touche que les profils en essai/gratuit.
      existant?.status === "ACTIVE" ? {} : { status: "TRIALING", trialEndsAt: nouvelleFin },
  });
}

/**
 * À appeler après chaque repas ajouté (cf. server/actions/meals.ts). Si ce
 * profil est un filleul pas encore validé, et qu'il a maintenant fini
 * l'onboarding + enregistré au moins `PARRAINAGE_REPAS_REQUIS` repas, valide
 * le parrainage et accorde la récompense aux deux côtés — une seule fois
 * (idempotent via `recompenseAccordee`), et seulement si le parrain n'a pas
 * atteint son plafond anti-abus.
 */
export async function verifierEtRecompenserParrainage(profileId: string): Promise<void> {
  const parrainage = await prisma.parrainage.findUnique({ where: { filleulId: profileId } });
  if (!parrainage || parrainage.recompenseAccordee) return;

  const [profile, nombreRepas] = await Promise.all([
    prisma.profile.findUnique({ where: { id: profileId } }),
    prisma.meal.count({ where: { profileId } }),
  ]);
  if (!profile?.onboardingTermine || nombreRepas < PARRAINAGE_REPAS_REQUIS) return;

  const recompensesDejaAccordees = await prisma.parrainage.count({
    where: { parrainId: parrainage.parrainId, recompenseAccordee: true },
  });
  if (recompensesDejaAccordees >= PARRAINAGE_PLAFOND_PAR_PARRAIN) {
    // Filleul réellement validé (repas + onboarding), mais plafond du
    // parrain atteint : on marque `valide` pour la traçabilité, sans
    // accorder de récompense ni la retenter à chaque repas suivant.
    await prisma.parrainage.update({ where: { id: parrainage.id }, data: { valide: true, valideLe: new Date() } });
    return;
  }

  await prisma.$transaction([
    prisma.parrainage.update({
      where: { id: parrainage.id },
      data: { valide: true, valideLe: new Date(), recompenseAccordee: true },
    }),
  ]);

  await Promise.all([accorderMoisPremium(parrainage.parrainId), accorderMoisPremium(parrainage.filleulId)]);
}
