"use client";

import { useEffect } from "react";

/**
 * Capture toute exception non gérée d'un Server/Client Component sous ce
 * segment (tout le site, car à la racine de `app/`). Sans ce fichier,
 * Next.js affiche l'écran générique "Application error: a server-side
 * exception has occurred" — blanc, en anglais, sans aucune action possible
 * pour l'utilisateur.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-creme-100 px-6 text-center">
      <p className="text-4xl" aria-hidden="true">
        😕
      </p>
      <h1 className="font-titre text-xl font-bold text-charbon-800">Un problème est survenu</h1>
      <p className="max-w-sm text-sm text-charbon-600">
        Quelque chose s&rsquo;est mal passé de notre côté. Réessaie — si ça persiste, reviens un peu plus tard.
      </p>
      {error.digest ? <p className="text-xs text-charbon-400">Référence : {error.digest}</p> : null}
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl bg-corail-500 px-6 py-3 font-titre font-semibold text-white hover:bg-corail-600"
        >
          Réessayer
        </button>
        <a
          href="/"
          className="rounded-2xl border border-charbon-400/20 bg-white px-6 py-3 font-titre font-semibold text-charbon-800 hover:bg-creme-200"
        >
          Retour à l&rsquo;accueil
        </a>
      </div>
    </div>
  );
}
