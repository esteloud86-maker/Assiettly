import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";
import { hacherImage, lireDuCache, ecrireDansLeCache } from "./cache";
import { ErreurAnalyseImage, ErreurQuotaAnthropic, ErreurReponseInvalide, ErreurTimeoutAnalyse } from "./errors";
import { FOOD_ANALYSIS_SYSTEM_PROMPT } from "./prompt";
import { ANALYSE_REPAS_JSON_SCHEMA, parserReponseAnalyse, type AnalyseRepas } from "./schema";

// Modèle isolé dans une seule constante pour pouvoir en changer sans toucher
// au reste du module (ex : passer à claude-opus-4-5-20251101 si la précision
// doit primer sur le coût, ou à la génération Sonnet 5/Opus 5 une fois
// évaluée). Toujours un snapshot daté, jamais un alias non versionné en prod.
const MODELE_ANALYSE = "claude-sonnet-4-5-20250929";
const MAX_TOKENS_REPONSE = 2048;
const TIMEOUT_MS = 25_000;

export type MediaTypeImage = "image/jpeg" | "image/png" | "image/webp";

export interface AnalyserPhotoRepasInput {
  profileId: string;
  imageBase64: string;
  mediaType: MediaTypeImage;
}

/**
 * Analyse une photo de repas via l'API Claude (vision + structured outputs)
 * et renvoie une estimation nutritionnelle structurée et vérifiée. Journalise
 * l'appel (modèle, confiance, durée, erreur éventuelle) sans jamais stocker
 * l'image elle-même, conformément aux contraintes RGPD déjà posées pour
 * l'app (minimisation des données).
 */
export async function analyserPhotoRepas({
  profileId,
  imageBase64,
  mediaType,
}: AnalyserPhotoRepasInput): Promise<AnalyseRepas> {
  const hash = hacherImage(imageBase64);
  const dejaEnCache = lireDuCache(hash);
  if (dejaEnCache) return dejaEnCache;

  const debut = Date.now();

  try {
    const message = await anthropic.messages.create(
      {
        model: MODELE_ANALYSE,
        max_tokens: MAX_TOKENS_REPONSE,
        system: FOOD_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
              { type: "text", text: "Analyse cette photo de repas." },
            ],
          },
        ],
        output_config: { format: { type: "json_schema", schema: ANALYSE_REPAS_JSON_SCHEMA } },
      },
      { timeout: TIMEOUT_MS },
    );

    const blocTexte = message.content.find((bloc) => bloc.type === "text");
    if (!blocTexte || blocTexte.type !== "text") {
      throw new ErreurReponseInvalide("Aucun contenu texte dans la réponse du modèle.");
    }

    let json: unknown;
    try {
      json = JSON.parse(blocTexte.text);
    } catch {
      throw new ErreurReponseInvalide("La réponse du modèle n'est pas un JSON valide.");
    }

    const resultat = parserReponseAnalyse(json);

    ecrireDansLeCache(hash, resultat);
    await journaliserAppel({
      profileId,
      confianceGlobale: resultat.confianceGlobale,
      nombreIngredients: resultat.ingredients.length,
      dureeMs: Date.now() - debut,
    });

    return resultat;
  } catch (erreur) {
    if (erreur instanceof ErreurReponseInvalide) {
      await journaliserAppel({ profileId, dureeMs: Date.now() - debut, erreur: erreur.message });
      throw erreur;
    }
    if (erreur instanceof Anthropic.APIConnectionTimeoutError) {
      await journaliserAppel({ profileId, dureeMs: Date.now() - debut, erreur: "timeout" });
      throw new ErreurTimeoutAnalyse();
    }
    if (erreur instanceof Anthropic.RateLimitError) {
      await journaliserAppel({ profileId, dureeMs: Date.now() - debut, erreur: "quota" });
      throw new ErreurQuotaAnthropic();
    }
    if (erreur instanceof Anthropic.BadRequestError) {
      await journaliserAppel({ profileId, dureeMs: Date.now() - debut, erreur: "image_invalide" });
      throw new ErreurAnalyseImage();
    }
    await journaliserAppel({
      profileId,
      dureeMs: Date.now() - debut,
      erreur: erreur instanceof Error ? erreur.message : "inconnue",
    });
    throw erreur;
  }
}

async function journaliserAppel(params: {
  profileId: string;
  confianceGlobale?: string;
  nombreIngredients?: number;
  dureeMs: number;
  erreur?: string;
}) {
  await prisma.foodAnalysisLog
    .create({
      data: {
        profileId: params.profileId,
        modele: MODELE_ANALYSE,
        confianceGlobale: params.confianceGlobale,
        nombreIngredients: params.nombreIngredients ?? 0,
        dureeMs: params.dureeMs,
        erreur: params.erreur,
      },
    })
    // Le log ne doit jamais faire échouer l'analyse elle-même si l'écriture échoue.
    .catch((e) => console.error("Échec de journalisation de l'analyse de repas", e));
}
