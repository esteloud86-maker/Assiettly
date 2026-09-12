"use server";

import { requireProfile } from "@/server/auth";
import { analyserPhotoRepas, type MediaTypeImage } from "@/server/foodAnalysis/analyserRepas";
import { ErreurAnalyseImage } from "@/server/foodAnalysis/errors";
import type { AnalyseRepas } from "@/server/foodAnalysis/schema";

const MEDIA_TYPES_AUTORISES: MediaTypeImage[] = ["image/jpeg", "image/png", "image/webp"];
// Base64 : ~1.37x la taille des octets d'origine. 8 Mo décodés ≈ 11 Mo encodés.
const TAILLE_BASE64_MAX = 11 * 1024 * 1024;

export async function analyserPhoto(input: { imageBase64: string; mediaType: string }): Promise<AnalyseRepas> {
  const profile = await requireProfile();

  if (!MEDIA_TYPES_AUTORISES.includes(input.mediaType as MediaTypeImage)) {
    throw new ErreurAnalyseImage("Format d'image non supporté (jpeg, png ou webp attendu).");
  }
  if (!input.imageBase64 || input.imageBase64.length > TAILLE_BASE64_MAX) {
    throw new ErreurAnalyseImage("Image manquante ou trop volumineuse (8 Mo max).");
  }

  return analyserPhotoRepas({
    profileId: profile.id,
    imageBase64: input.imageBase64,
    mediaType: input.mediaType as MediaTypeImage,
  });
}
