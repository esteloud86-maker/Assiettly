import { STREAK_BADGE_PALIERS, type StreakBadgePalier } from "./types";

export interface EvaluationJourInput {
  caloriesJour: number;
  objectifCaloriesKcal: number;
  tolerancePct: number;
  aAuMoinsUnRepasAjoute: boolean;
}

/**
 * Une flamme s'allume si au moins un repas a été ajouté ET que les calories
 * du jour sont dans la fourchette [objectif - tolérance%, objectif + tolérance%].
 */
export function evaluerObjectifJour(input: EvaluationJourInput): boolean {
  if (!input.aAuMoinsUnRepasAjoute) return false;
  const marge = input.objectifCaloriesKcal * (input.tolerancePct / 100);
  const borneBasse = input.objectifCaloriesKcal - marge;
  const borneHaute = input.objectifCaloriesKcal + marge;
  return input.caloriesJour >= borneBasse && input.caloriesJour <= borneHaute;
}

export interface JourStreak {
  /** Date au format ISO yyyy-mm-dd */
  date: string;
  flammeAllumee: boolean;
  freezeUtilise: boolean;
}

export interface StreakSummaryCalcule {
  streakActuel: number;
  streakMax: number;
}

function diffEnJours(dateA: string, dateB: string): number {
  const a = Date.UTC(...(dateA.split("-").map(Number) as [number, number, number]));
  const b = Date.UTC(...(dateB.split("-").map(Number) as [number, number, number]));
  return Math.round((a - b) / 86_400_000);
}

/**
 * Recalcule le streak (actuel + max) à partir de l'historique des jours.
 * `jours` doit être trié par date croissante et ne contenir que des jours
 * qui ont soit une flamme, soit un freeze (les jours "cassés" sont absents).
 * Les trous de date (jours manquants) interrompent la série.
 */
export function calculerStreakSummary(jours: JourStreak[]): StreakSummaryCalcule {
  let streakMax = 0;
  let streakCourant = 0;
  let precedent: JourStreak | null = null;

  for (const jour of jours) {
    const consecutif = precedent !== null && diffEnJours(jour.date, precedent.date) === 1;
    if (!consecutif) {
      streakCourant = 0;
    }
    if (jour.flammeAllumee) {
      streakCourant += 1;
    }
    // un jour freeze prolonge la série sans l'incrémenter
    streakMax = Math.max(streakMax, streakCourant);
    precedent = jour;
  }

  // Le streak "actuel" est la série se terminant sur le dernier jour connu.
  // Si le dernier jour connu a un trou par rapport à aujourd'hui (appelant
  // doit vérifier ça côté service, car cette fonction pure ignore "aujourd'hui"),
  // c'est au service de décider de remettre streakActuel à 0.
  return { streakActuel: streakCourant, streakMax };
}

export function palierAtteint(streak: number): StreakBadgePalier | null {
  const paliersAtteints = STREAK_BADGE_PALIERS.filter((p) => streak >= p);
  return paliersAtteints.length > 0 ? paliersAtteints[paliersAtteints.length - 1] : null;
}

export function prochainPalier(streak: number): StreakBadgePalier | null {
  return STREAK_BADGE_PALIERS.find((p) => p > streak) ?? null;
}
