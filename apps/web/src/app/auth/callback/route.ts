import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'échange unique pour les liens Supabase Auth : confirmation
 * d'e-mail, mot de passe oublié, et (si réactivé un jour) OAuth
 * Google/Apple. Redirige vers `next` (par défaut le dashboard, qui
 * redirige lui-même vers l'onboarding si besoin) une fois la session
 * établie.
 *
 * Deux formats de lien sont acceptés :
 * - `token_hash` + `type` : lien construit à partir de `{{ .TokenHash }}`
 *   dans le template d'e-mail Supabase. Vérifié via `verifyOtp`, sans
 *   dépendre d'un `code_verifier` stocké côté navigateur d'origine — donc
 *   fonctionne même si le lien est ouvert sur un autre appareil ou dans un
 *   autre navigateur (ex. webview Gmail/Outlook). C'est le format à
 *   utiliser pour les templates "Confirm signup" et "Reset Password" (cf.
 *   PROGRESS.md pour la configuration exacte à appliquer dans le
 *   dashboard Supabase).
 * - `code` : flux PKCE classique (utilisé par défaut par
 *   `{{ .ConfirmationURL }}` tant que le template n'a pas été personnalisé,
 *   et par les fournisseurs OAuth). Nécessite que la demande ait été
 *   initiée dans le même navigateur — conservé pour compatibilité tant que
 *   les templates Supabase n'ont pas été mis à jour.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/accueil";

  const supabase = createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=auth`);
}
