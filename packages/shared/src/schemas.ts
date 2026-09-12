import { z } from "zod";

export const sexeSchema = z.enum(["HOMME", "FEMME"]);
export const niveauActiviteSchema = z.enum([
  "SEDENTAIRE",
  "LEGER",
  "MODERE",
  "ACTIF",
  "TRES_ACTIF",
]);
export const objectifTypeSchema = z.enum(["PERTE", "MAINTIEN", "PRISE_MASSE"]);
export const mealTypeSchema = z.enum(["PETIT_DEJ", "DEJEUNER", "DINER", "COLLATION"]);

export const profilPhysiqueSchema = z.object({
  sexe: sexeSchema,
  dateNaissance: z.string().date(),
  tailleCm: z.number().int().min(50).max(250),
  poidsKg: z.number().min(20).max(400),
  niveauActivite: niveauActiviteSchema,
  objectifType: objectifTypeSchema,
});

export const updateProfileSchema = z.object({
  nom: z.string().min(1).max(120).optional(),
  sexe: sexeSchema.optional(),
  dateNaissance: z.string().date().optional(),
  tailleCm: z.number().int().min(50).max(250).optional(),
  niveauActivite: niveauActiviteSchema.optional(),
  objectifType: objectifTypeSchema.optional(),
});

export const createWeightLogSchema = z.object({
  poidsKg: z.number().min(20).max(400),
  date: z.string().date(),
});

export const createFoodSchema = z.object({
  nom: z.string().min(1).max(200),
  marque: z.string().max(120).optional(),
  codeBarre: z.string().max(32).optional(),
  caloriesKcal100g: z.number().min(0).max(2000),
  proteinesG100g: z.number().min(0).max(200),
  glucidesG100g: z.number().min(0).max(200),
  lipidesG100g: z.number().min(0).max(200),
  fibresG100g: z.number().min(0).max(100).optional(),
});

export const mealItemInputSchema = z.object({
  foodId: z.string().uuid().optional(),
  nomLibre: z.string().min(1).max(200).optional(),
  quantiteG: z.number().min(1).max(5000),
  // requis si foodId absent (aliment "libre" saisi à la main sans fiche nutritionnelle)
  caloriesKcal: z.number().min(0).optional(),
  proteinesG: z.number().min(0).optional(),
  glucidesG: z.number().min(0).optional(),
  lipidesG: z.number().min(0).optional(),
  fibresG: z.number().min(0).optional(),
});

export const createMealSchema = z.object({
  date: z.string().date(),
  type: mealTypeSchema,
  items: z.array(mealItemInputSchema).min(1),
});

export const freezeStreakSchema = z.object({
  date: z.string().date(),
});
