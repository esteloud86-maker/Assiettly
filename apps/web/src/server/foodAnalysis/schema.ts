import { z } from "zod";

/**
 * Schéma JSON passé à `output_config.format` (structured outputs). Étendu par
 * rapport au schéma d'origine avec `quantite_estimee_g` (nombre) en plus de
 * `quantite_estimee` (texte) : il faut une valeur numérique exploitable pour
 * calculer les totaux et ajuster les portions côté app, le texte seul ne
 * suffit pas. `additionalProperties: false` est requis par l'API sur chaque
 * objet du schéma.
 *
 * ⚠️ Ce fichier est la source de vérité versionnée du contrat de sortie du
 * modèle. Le schéma zod ci-dessous doit rester le miroir exact de ce schéma
 * JSON (même structure, mêmes champs requis) : c'est lui qui valide la
 * réponse à l'exécution, en défense en profondeur au cas où le modèle ou
 * l'API dévierait malgré les structured outputs.
 */
export const ANALYSE_REPAS_JSON_SCHEMA = {
  type: "object",
  properties: {
    nom_plat: { type: "string" },
    confiance_globale: { type: "string", enum: ["haute", "moyenne", "basse"] },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nom: { type: "string" },
          quantite_estimee: { type: "string" },
          quantite_estimee_g: { type: "number" },
          calories: { type: "number" },
          proteines_g: { type: "number" },
          glucides_g: { type: "number" },
          lipides_g: { type: "number" },
          confiance: { type: "string", enum: ["haute", "moyenne", "basse"] },
        },
        required: [
          "nom",
          "quantite_estimee",
          "quantite_estimee_g",
          "calories",
          "proteines_g",
          "glucides_g",
          "lipides_g",
          "confiance",
        ],
        additionalProperties: false,
      },
    },
    totaux: {
      type: "object",
      properties: {
        calories: { type: "number" },
        proteines_g: { type: "number" },
        glucides_g: { type: "number" },
        lipides_g: { type: "number" },
      },
      required: ["calories", "proteines_g", "glucides_g", "lipides_g"],
      additionalProperties: false,
    },
  },
  required: ["nom_plat", "confiance_globale", "ingredients", "totaux"],
  additionalProperties: false,
} as const;

const niveauConfianceSchema = z.enum(["haute", "moyenne", "basse"]);

export const ingredientDetecteSchema = z.object({
  nom: z.string(),
  quantiteEstimee: z.string(),
  quantiteEstimeeG: z.number(),
  calories: z.number(),
  proteinesG: z.number(),
  glucidesG: z.number(),
  lipidesG: z.number(),
  confiance: niveauConfianceSchema,
});

export const analyseRepasSchema = z.object({
  nomPlat: z.string(),
  confianceGlobale: niveauConfianceSchema,
  ingredients: z.array(ingredientDetecteSchema),
  totaux: z.object({
    calories: z.number(),
    proteinesG: z.number(),
    glucidesG: z.number(),
    lipidesG: z.number(),
  }),
});

export type NiveauConfiance = z.infer<typeof niveauConfianceSchema>;
export type IngredientDetecte = z.infer<typeof ingredientDetecteSchema>;
export type AnalyseRepas = z.infer<typeof analyseRepasSchema>;

/**
 * Le modèle répond en snake_case (imposé par le schéma JSON ci-dessus) ; on
 * convertit vers le camelCase utilisé partout ailleurs dans l'app, puis on
 * valide avec le schéma zod.
 */
export function parserReponseAnalyse(json: unknown): AnalyseRepas {
  const brut = json as Record<string, unknown>;
  const ingredients = Array.isArray(brut.ingredients) ? brut.ingredients : [];

  return analyseRepasSchema.parse({
    nomPlat: brut.nom_plat,
    confianceGlobale: brut.confiance_globale,
    ingredients: ingredients.map((i) => {
      const item = i as Record<string, unknown>;
      return {
        nom: item.nom,
        quantiteEstimee: item.quantite_estimee,
        quantiteEstimeeG: item.quantite_estimee_g,
        calories: item.calories,
        proteinesG: item.proteines_g,
        glucidesG: item.glucides_g,
        lipidesG: item.lipides_g,
        confiance: item.confiance,
      };
    }),
    totaux: {
      calories: (brut.totaux as Record<string, unknown> | undefined)?.calories,
      proteinesG: (brut.totaux as Record<string, unknown> | undefined)?.proteines_g,
      glucidesG: (brut.totaux as Record<string, unknown> | undefined)?.glucides_g,
      lipidesG: (brut.totaux as Record<string, unknown> | undefined)?.lipides_g,
    },
  });
}
