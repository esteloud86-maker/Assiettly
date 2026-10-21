import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const ROUTES_PUBLIQUES = [
  "/",
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/auth/callback",
  "/mentions-legales",
  "/cgu",
  "/confidentialite",
  "/api/webhooks",
];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const estRoutePublique = ROUTES_PUBLIQUES.some(
    (route) => request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(`${route}/`),
  );

  if (!user && !estRoutePublique) {
    // Un cookie de session existait mais `getUser()` n'a pas pu le valider
    // (ex: refresh token invalidé par la rotation de sécurité de Supabase
    // après des requêtes concurrentes — déjà observé en production, cf.
    // PROGRESS.md) : c'est une vraie déconnexion, pas une première visite.
    // Sans cette distinction, l'utilisateur atterrissait sur /connexion
    // sans aucune explication, ce qui ressemble à un bug.
    const avaitUneSession = request.cookies.getAll().some((c) => /^sb-.*-auth-token/.test(c.name));
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    if (avaitUneSession) url.searchParams.set("erreur", "session_expiree");
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Le manifest, le service worker et les icônes doivent rester joignables
  // sans session (le navigateur les récupère avant toute authentification
  // pour juger l'installabilité) — sans cette exclusion, le middleware les
  // redirigeait vers /connexion comme n'importe quelle route protégée.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|webmanifest)$).*)",
  ],
};
