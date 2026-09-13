import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

let client: ReturnType<typeof createSupabaseJsClient> | null = null;

/**
 * Client Supabase avec la clé service_role — seul moyen de supprimer
 * définitivement un compte auth.users (ex: droit RGPD à l'effacement).
 * Optionnel : renvoie `null` si `SUPABASE_SERVICE_ROLE_KEY` n'est pas
 * configurée (ex: en local), auquel cas la suppression de compte efface
 * quand même toutes les données applicatives mais laisse le compte Supabase
 * Auth actif (l'utilisateur pourrait se reconnecter et redémarrer un
 * onboarding vierge) — cf. `supprimerMonCompte` dans
 * `server/actions/rgpd.ts`.
 */
export function creerClientAdmin() {
  const cleServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!cleServiceRole) return null;

  if (!client) {
    client = createSupabaseJsClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, cleServiceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
