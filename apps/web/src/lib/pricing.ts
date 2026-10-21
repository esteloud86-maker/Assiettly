/**
 * Source unique pour les montants et le quota gratuit affichés sur la
 * landing, le paywall, la FAQ et les CGU — pensée pour être facilement
 * changée/testée en A/B (le brief landing le demande explicitement).
 *
 * ⚠️ Ces montants sont uniquement du texte d'affichage. Le montant
 * réellement prélevé est celui configuré sur les Price Stripe pointés par
 * `STRIPE_PRICE_ID_MENSUEL`/`STRIPE_PRICE_ID_ANNUEL` (cf. `.env`) — si tu
 * changes un prix ici, il faut aussi mettre à jour (ou créer) le Price
 * correspondant dans le dashboard Stripe, sinon le prix affiché et le prix
 * facturé divergent (publicité trompeuse).
 */
// " €" (espace insécable avant le symbole) : typographie française des
// prix — évite qu'un retour à la ligne isole le "€" seul en fin de ligne.
export const TARIFS = {
  essaiJours: 7,
  mensuel: { prixAffiche: "6,99 €", periode: "/mois" },
  annuel: {
    prixAffiche: "39,99 €",
    periode: "/an",
    equivalentMensuel: "3,33 €/mois",
    reductionPct: 52,
  },
} as const;

/** Quota de scans par photo pour un profil non premium (hors essai), par jour calendaire (Europe/Paris). */
export const SCANS_GRATUITS_PAR_JOUR = 3;

/**
 * Gels de flamme (freezes) par mois calendaire. Remplace l'ancienne
 * constante fixe `FREEZES_MAX_PAR_MOIS` de `@assiettly/shared` — la limite
 * dépend maintenant du statut premium, vérifiée côté serveur dans
 * `server/streak.ts` (`geler`).
 */
export const FREEZES_GRATUIT_PAR_MOIS = 2;
export const FREEZES_PREMIUM_PAR_MOIS = 5;

export function freezesMaxParMois(premium: boolean): number {
  return premium ? FREEZES_PREMIUM_PAR_MOIS : FREEZES_GRATUIT_PAR_MOIS;
}

/**
 * Favoris et "Répéter ce repas" : fonctionnalité réservée à Premium (pas de
 * palier gratuit annoncé pour l'instant — cf. PROGRESS.md, le brief ne liste
 * ça que sous Premium).
 */
export const FAVORIS_RESERVE_PREMIUM = true;

/** Nombre de repas à enregistrer pour qu'un filleul valide le parrainage. */
export const PARRAINAGE_REPAS_REQUIS = 3;
/** Mois Premium offerts à chaque parrainage validé (parrain ET filleul). */
export const PARRAINAGE_MOIS_OFFERTS = 1;
/** Anti-abus : plafond de récompenses accordées par parrain (cf. brief viralité). */
export const PARRAINAGE_PLAFOND_PAR_PARRAIN = 12;
