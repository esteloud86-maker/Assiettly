"use server";

import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/server/auth";
import { estPremium } from "@/server/billing";
import { analyserPhotoRepas, type MediaTypeImage } from "@/server/foodAnalysis/analyserRepas";
import { ErreurAnalyseImage, ErreurQuotaScanGratuit } from "@/server/foodAnalysis/errors";
import type { AnalyseRepas } from "@/server/foodAnalysis/schema";

const MEDIA_TYPES_AUTORISES: MediaTypeImage[] = ["image/jpeg", "image/png", "image/webp"];
// Base64 : ~1.37x la taille des octets d'origine. 8 Mo décodés ≈ 11 Mo encodés.
const TAILLE_BASE64_MAX = 11 * 1024 * 1024;
// Offre gratuite annoncée sur la landing et le paywall : "3 scans de repas
// par semaine". Fenêtre glissante de 7 jours (pas semaine calendaire) pour
// rester simple et sans effet de bord de fuseau horaire sur une frontière
// de jour.
const SCANS_GRATUITS_PAR_SEMAINE = 3;
const FENETRE_QUOTA_MS = 7 * 24 * 60 * 60 * 1000;

export async function analyserPhoto(input: { imageBase64: string; mediaType: string }): Promise<AnalyseRepas> {
  const profile = await requireProfile();

  if (!MEDIA_TYPES_AUTORISES.includes(input.mediaType as MediaTypeImage)) {
    throw new ErreurAnalyseImage("Format d'image non supporté (jpeg, png ou webp attendu).");
  }
  if (!input.imageBase64 || input.imageBase64.length > TAILLE_BASE64_MAX) {
    throw new ErreurAnalyseImage("Image manquante ou trop volumineuse (8 Mo max).");
  }

  if (!estPremium(profile.subscription)) {
    // Ne compte que les analyses réussies (erreur = null) : un scan qui a
    // échoué (timeout, image illisible) ne doit pas consommer le quota
    // hebdomadaire gratuit de l'utilisateur.
    const scansRecents = await prisma.foodAnalysisLog.count({
      where: {
        profileId: profile.id,
        erreur: null,
        createdAt: { gte: new Date(Date.now() - FENETRE_QUOTA_MS) },
      },
    });
    if (scansRecents >= SCANS_GRATUITS_PAR_SEMAINE) {
      throw new ErreurQuotaScanGratuit();
    }
  }

  return analyserPhotoRepas({
    profileId: profile.id,
    imageBase64: input.imageBase64,
    mediaType: input.mediaType as MediaTypeImage,
  });
}
