import type { AuthError } from "@supabase/supabase-js";

/**
 * Traduit les codes d'erreur Supabase Auth en messages français clairs et
 * actionnables — jamais le message brut renvoyé par l'API (souvent en
 * anglais, ex: "Invalid login credentials"). Repéré en conditions réelles
 * via les logs Supabase (cf. PROGRESS.md) : c'était jusqu'ici affiché tel
 * quel à l'utilisateur.
 *
 * "E-mail ou mot de passe incorrect" reste volontairement identique que le
 * compte n'existe pas ou que le mot de passe soit faux — Supabase masque
 * déjà cette distinction côté serveur pour empêcher l'énumération
 * d'adresses e-mail valides ; la lever ici serait une régression de
 * sécurité, pas une amélioration.
 */
export function messageErreurAuth(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "E-mail ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Confirme d'abord ton adresse e-mail avant de te connecter.";
    case "user_already_exists":
    case "email_exists":
      return 'Un compte existe déjà avec cet e-mail. Connecte-toi, ou utilise "Mot de passe oublié" si besoin.';
    case "weak_password":
      return "Mot de passe trop faible — utilise au moins 6 caractères.";
    case "same_password":
      return "Ce mot de passe est déjà le tien — choisis-en un différent.";
    case "over_request_rate_limit":
      return "Trop de tentatives. Réessaie dans quelques minutes.";
    case "over_email_send_rate_limit":
      return "Trop d'e-mails envoyés récemment. Réessaie dans quelques minutes.";
    case "user_banned":
      return "Ce compte est suspendu. Contacte le support si tu penses que c'est une erreur.";
    case "session_expired":
    case "refresh_token_not_found":
    case "refresh_token_already_used":
      return "Ta session a expiré. Reconnecte-toi pour continuer.";
    default:
      return "Une erreur est survenue. Réessaie dans quelques instants.";
  }
}
