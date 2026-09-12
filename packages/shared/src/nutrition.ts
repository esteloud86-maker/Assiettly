import type {
  MacroTargets,
  NiveauActivite,
  ObjectifType,
  ProfilPhysique,
  ProjectionObjectif,
} from "./types";

/** Équivalence calorique conventionnelle d'1 kg de masse grasse. */
const KCAL_PAR_KG = 7700;

const FACTEURS_ACTIVITE: Record<NiveauActivite, number> = {
  SEDENTAIRE: 1.2,
  LEGER: 1.375,
  MODERE: 1.55,
  ACTIF: 1.725,
  TRES_ACTIF: 1.9,
};

// Ajustement calorique quotidien par objectif (déficit/surplus modéré, ~0.5 kg/semaine)
const AJUSTEMENT_OBJECTIF_KCAL: Record<ObjectifType, number> = {
  PERTE: -500,
  MAINTIEN: 0,
  PRISE_MASSE: 300,
};

function ageEnAnnees(dateNaissanceIso: string, aujourdHui = new Date()): number {
  const naissance = new Date(dateNaissanceIso);
  let age = aujourdHui.getFullYear() - naissance.getFullYear();
  const moisEcart = aujourdHui.getMonth() - naissance.getMonth();
  if (moisEcart < 0 || (moisEcart === 0 && aujourdHui.getDate() < naissance.getDate())) {
    age -= 1;
  }
  return age;
}

/**
 * Métabolisme de base (formule de Mifflin-St Jeor). Pour "AUTRE", on prend
 * la moyenne des deux ajustements (+5 / -161) faute de formule dédiée.
 */
export function calculerBMR(profil: ProfilPhysique): number {
  const age = ageEnAnnees(profil.dateNaissance);
  const base = 10 * profil.poidsKg + 6.25 * profil.tailleCm - 5 * age;
  if (profil.sexe === "HOMME") return base + 5;
  if (profil.sexe === "FEMME") return base - 161;
  return base - 78;
}

/** Dépense énergétique totale journalière (BMR * facteur d'activité). */
export function calculerTDEE(profil: ProfilPhysique): number {
  return calculerBMR(profil) * FACTEURS_ACTIVITE[profil.niveauActivite];
}

/**
 * Objectifs caloriques et macros quotidiens à partir du profil physique.
 * Répartition macro par défaut : 30% protéines, 40% glucides, 30% lipides.
 */
export function calculerObjectifs(profil: ProfilPhysique): MacroTargets {
  const tdee = calculerTDEE(profil);
  const caloriesKcal = Math.round(tdee + AJUSTEMENT_OBJECTIF_KCAL[profil.objectifType]);

  const proteinesG = Math.round((caloriesKcal * 0.3) / 4);
  const glucidesG = Math.round((caloriesKcal * 0.4) / 4);
  const lipidesG = Math.round((caloriesKcal * 0.3) / 9);

  return { caloriesKcal, proteinesG, glucidesG, lipidesG };
}

/**
 * Estime la date d'atteinte du poids cible, à partir de l'écart de poids et
 * du déficit/surplus calorique quotidien impliqué par l'objectif choisi.
 * Retourne `null` si l'objectif est "maintien" ou si le poids cible est égal
 * au poids actuel (aucune projection pertinente).
 */
export function calculerProjection(
  profil: ProfilPhysique,
  poidsCibleKg: number,
  aujourdHui = new Date(),
): ProjectionObjectif {
  const ecartKg = Math.abs(profil.poidsKg - poidsCibleKg);
  const ajustementQuotidien = Math.abs(AJUSTEMENT_OBJECTIF_KCAL[profil.objectifType]);

  if (profil.objectifType === "MAINTIEN" || ecartKg < 0.1 || ajustementQuotidien === 0) {
    return { joursEstimes: null, dateEstimee: null };
  }

  const joursEstimes = Math.round((ecartKg * KCAL_PAR_KG) / ajustementQuotidien);
  const dateEstimee = new Date(aujourdHui);
  dateEstimee.setDate(dateEstimee.getDate() + joursEstimes);

  return { joursEstimes, dateEstimee: dateEstimee.toISOString().slice(0, 10) };
}

/**
 * Fourchette de poids usuellement considérée saine pour une taille donnée
 * (IMC entre 18,5 et 25). Sert uniquement à afficher un avertissement doux
 * à l'onboarding si le poids cible saisi sort largement de cette fourchette
 * — jamais un diagnostic, juste une invitation à la prudence.
 */
export function calculerFourchettePoidsSain(tailleCm: number): { minKg: number; maxKg: number } {
  const tailleM = tailleCm / 100;
  return {
    minKg: Math.round(18.5 * tailleM * tailleM),
    maxKg: Math.round(25 * tailleM * tailleM),
  };
}
