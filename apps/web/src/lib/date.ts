/**
 * Assiettly cible le marché français : ces utilitaires calculent le
 * "aujourd'hui" tel que perçu par un utilisateur en France (fuseau
 * Europe/Paris, heure d'été gérée automatiquement), plutôt que de se fier au
 * fuseau UTC du serveur.
 *
 * `new Date()` côté serveur reste toujours en UTC. Paris étant en avance sur
 * UTC (+1h hiver / +2h été), le calendrier local bascule au jour suivant
 * avant le calendrier UTC : entre ~22h/23h UTC et minuit UTC (soit 0h-2h du
 * matin heure de Paris selon la saison), `new Date().toISOString()` renvoie
 * encore la date de la veille alors que c'est déjà "demain" pour
 * l'utilisateur. Sans ce correctif, ça décale de facto le calcul de "quel
 * jour sommes-nous" (dashboard, tendances, compteur de freezes mensuel)
 * chaque nuit pendant cette fenêtre.
 */
const FUSEAU_UTILISATEURS = "Europe/Paris";

/** Date du jour (YYYY-MM-DD) telle que vécue par les utilisateurs français. */
export function aujourdHuiLocal(reference = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: FUSEAU_UTILISATEURS }).format(reference);
}

/**
 * `aujourdHuiLocal()` sous forme de `Date` à minuit UTC — le format attendu
 * pour comparer avec les colonnes `@db.Date` de Prisma, qui stockent des
 * dates calendaires alignées sur minuit UTC.
 */
export function aujourdHuiLocalCommeDate(reference = new Date()): Date {
  return new Date(`${aujourdHuiLocal(reference)}T00:00:00.000Z`);
}
