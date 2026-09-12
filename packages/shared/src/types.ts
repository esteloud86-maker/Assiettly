export type Sexe = "HOMME" | "FEMME" | "AUTRE";

export type NiveauActivite =
  | "SEDENTAIRE"
  | "LEGER"
  | "MODERE"
  | "ACTIF"
  | "TRES_ACTIF";

export type ObjectifType = "PERTE" | "MAINTIEN" | "PRISE_MASSE";

export type TypeAlimentation = "EQUILIBRE" | "VEGETARIEN" | "VEGAN" | "PESCETARIEN" | "FLEXITARIEN";

export type MotivationPrincipale =
  | "MIEUX_MANGER"
  | "PLUS_ENERGIE"
  | "RESTER_MOTIVE"
  | "BIEN_DANS_SON_CORPS";

export type Frein =
  | "MANQUE_REGULARITE"
  | "MANQUE_TEMPS"
  | "MANQUE_INSPIRATION"
  | "ENVIES_SUCREES"
  | "REPAS_SOCIAUX"
  | "MANQUE_SOUTIEN";

export type MealType = "PETIT_DEJ" | "DEJEUNER" | "DINER" | "COLLATION";

export interface MacroTargets {
  caloriesKcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
}

export interface MacroValues {
  caloriesKcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  fibresG?: number;
}

export interface ProfilPhysique {
  sexe: Sexe;
  dateNaissance: string; // ISO date
  tailleCm: number;
  poidsKg: number;
  niveauActivite: NiveauActivite;
  objectifType: ObjectifType;
}

export interface ProjectionObjectif {
  /** Nombre de jours estimés pour atteindre le poids cible (null si non pertinent). */
  joursEstimes: number | null;
  dateEstimee: string | null; // ISO date
}

export const STREAK_BADGE_PALIERS = [7, 30, 100, 365] as const;
export type StreakBadgePalier = (typeof STREAK_BADGE_PALIERS)[number];

export const FREEZES_MAX_PAR_MOIS = 2;
export const TOLERANCE_CALORIES_PCT_DEFAUT = 10;
