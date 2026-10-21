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
export const TARIFS = {
  essaiJours: 7,
  mensuel: { prixAffiche: "6,99€", periode: "/mois" },
  annuel: {
    prixAffiche: "39,99€",
    periode: "/an",
    equivalentMensuel: "3,33€/mois",
    reductionPct: 52,
  },
} as const;

/** Quota de scans par photo pour un profil non premium (hors essai), par jour calendaire (Europe/Paris). */
export const SCANS_GRATUITS_PAR_JOUR = 3;
