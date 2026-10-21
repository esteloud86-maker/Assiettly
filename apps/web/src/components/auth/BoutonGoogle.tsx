"use client";

import { useEffect, useState } from "react";
import { estNavigateurInApp } from "@/lib/detectionPlateforme";
import { createClient } from "@/lib/supabase/client";

/** Logo "G" officiel Google (couleurs de marque, non modifié) — https://developers.google.com/identity/branding-guidelines */
function IconeGoogle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.3 21.3 7.3 24 12 24z"
      />
      <path fill="#FBBC05" d="M5.4 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.4C.5 8.3 0 10.1 0 12s.5 3.7 1.4 5.4z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
      />
    </svg>
  );
}

/**
 * Bouton "Continuer avec Google" — réactivé après correction du bug de
 * redirection (cf. PROGRESS.md). Pas de bouton Apple ici : volontairement
 * exclu tant qu'il n'est pas configuré côté Apple/Supabase (code toujours
 * isolé dans BoutonsOAuth.tsx, prêt à être réactivé plus tard).
 */
export function BoutonGoogle() {
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  // Lu uniquement après montage (navigator.userAgent) pour ne jamais
  // produire un mismatch d'hydratation SSR/client.
  const [navigateurInApp, setNavigateurInApp] = useState(false);

  useEffect(() => {
    setNavigateurInApp(estNavigateurInApp());
  }, []);

  async function connecter() {
    setErreur(null);
    setChargement(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErreur(error.message);
      setChargement(false);
    }
    // En cas de succès, le navigateur est déjà en train de quitter la page
    // vers Google — rien d'autre à faire ici.
  }

  if (navigateurInApp) {
    return (
      <p className="rounded-xl border border-creme-200 bg-creme-50 p-3.5 text-center text-sm text-charbon-600">
        Pour te connecter avec Google, ouvre ce lien dans Safari ou Chrome (menu ••• ou ⋮ de cette appli) — ou
        utilise directement ton e-mail ci-dessous.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={connecter}
        disabled={chargement}
        className="flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-creme-200 bg-white py-3 font-medium text-charbon-800 disabled:opacity-50"
      >
        <IconeGoogle className="h-5 w-5 shrink-0" />
        {chargement ? "Redirection..." : "Continuer avec Google"}
      </button>
      {erreur ? <p className="mt-2 text-center text-sm text-corail-600">{erreur}</p> : null}
    </div>
  );
}
