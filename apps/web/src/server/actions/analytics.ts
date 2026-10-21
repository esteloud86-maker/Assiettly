"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/server/auth";

export type EvenementType = "PARTAGE_CARTE" | "INVITATION_ENVOYEE" | "PAYWALL_VU" | "ABONNEMENT_DEMARRE";

/**
 * Sert uniquement à mesurer ce qui marche (partages, invitations, paywalls
 * vus, conversions) — jamais affiché à l'utilisateur comme un chiffre
 * marketing (cf. brief viralité : pas de faux chiffres). N'échoue jamais
 * bruyamment : un événement raté ne doit jamais casser l'action réelle de
 * l'utilisateur (partager une carte, voir un paywall...).
 */
export async function enregistrerEvenement(type: EvenementType, contexte?: Record<string, unknown>) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return;

    await prisma.analyticsEvent.create({
      data: { profileId: profile.id, type, contexte: (contexte as Prisma.InputJsonValue) ?? undefined },
    });
  } catch (erreur) {
    console.error("[analytics] Échec de l'enregistrement de l'événement", type, erreur);
  }
}
