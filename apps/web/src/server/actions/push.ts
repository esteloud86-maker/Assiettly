"use server";

import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/server/auth";

export interface AbonnementPushInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Enregistre (ou met à jour) l'abonnement push du profil courant. */
export async function enregistrerAbonnementPush(abonnement: AbonnementPushInput) {
  const profile = await requireProfile();

  await prisma.pushSubscription.upsert({
    where: { endpoint: abonnement.endpoint },
    create: {
      profileId: profile.id,
      endpoint: abonnement.endpoint,
      p256dh: abonnement.keys.p256dh,
      auth: abonnement.keys.auth,
    },
    update: {
      profileId: profile.id,
      p256dh: abonnement.keys.p256dh,
      auth: abonnement.keys.auth,
    },
  });
}

/** Retire l'abonnement push du profil courant (ex: désactivation depuis le profil). */
export async function supprimerAbonnementPush(endpoint: string) {
  const profile = await requireProfile();
  // Scoper par profileId (en plus de l'endpoint) empêche un appelant de
  // supprimer l'abonnement push d'un autre profil en devinant/rejouant un
  // endpoint qui ne lui appartient pas.
  await prisma.pushSubscription.deleteMany({ where: { endpoint, profileId: profile.id } });
}
