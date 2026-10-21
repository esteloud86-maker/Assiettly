"use client";

/**
 * ⚠️ Apple seul reste désactivé ici (pas encore configuré côté Apple
 * Developer / Supabase) — Google a été réactivé et déplacé dans
 * `BoutonGoogle.tsx` (cf. PROGRESS.md pour la config finale). Ce composant
 * n'est importé nulle part : gardé tel quel plutôt que supprimé, prêt à
 * être réactivé le jour où Apple est configuré.
 */

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Provider = "apple";

function IconeApple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 1.3c0 1-.4 2-1.1 2.8-.7.8-1.9 1.5-3 1.4-.1-1 .4-2.1 1.1-2.8.7-.8 1.9-1.4 3-1.4zm2.9 17.3c-.6 1.3-.9 1.9-1.7 3-1.1 1.6-2.6 3.6-4.5 3.6-1.7 0-2.1-1.1-4.4-1.1-2.3 0-2.8 1.1-4.5 1.1-1.9 0-3.3-1.8-4.4-3.4C-2.4 17.8-1 10.8 3 8.3c1.1-.7 2.4-1.1 3.6-1.1 1.4 0 2.3 1.2 4.4 1.2 2 0 2.6-1.2 4.4-1.2 1.1 0 2.9.4 4.1 2.1-3.6 2-3 7.2 0 9.3z" />
    </svg>
  );
}

export function BoutonsOAuth() {
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState<Provider | null>(null);

  async function connecter(provider: Provider) {
    setErreur(null);
    setChargement(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErreur(error.message);
      setChargement(null);
    }
    // en cas de succès, le navigateur est redirigé vers le fournisseur — pas besoin de faire autre chose ici
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => connecter("apple")}
        disabled={chargement !== null}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-creme-200 bg-white py-3 font-medium text-charbon-800 disabled:opacity-50"
      >
        <IconeApple className="h-4 w-4" />
        {chargement === "apple" ? "Redirection..." : "Continuer avec Apple"}
      </button>
      {erreur ? <p className="text-center text-sm text-corail-600">{erreur}</p> : null}
    </div>
  );
}
