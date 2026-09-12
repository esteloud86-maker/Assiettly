import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Point d'échange unique pour les liens Supabase Auth qui renvoient un
 * `code` (OAuth Google/Apple, mais aussi les liens "mot de passe oublié" et
 * de confirmation d'e-mail) : on échange ce code contre une session, puis on
 * redirige vers `next` (par défaut le dashboard, qui redirige lui-même vers
 * l'onboarding si besoin).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/accueil";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?erreur=auth`);
}
