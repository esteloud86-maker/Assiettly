"use client";

import { useState } from "react";
import { enregistrerEvenement } from "@/server/actions/analytics";

export function CarteLienParrainage({ url }: { url: string | null }) {
  const [copie, setCopie] = useState(false);

  if (!url) {
    return (
      <div className="rounded-2xl bg-creme-50 p-5 text-sm text-charbon-400 shadow-sm">
        Ton lien de parrainage n&rsquo;est pas encore prêt, réessaie dans un instant.
      </div>
    );
  }

  async function copier() {
    await navigator.clipboard.writeText(url!);
    setCopie(true);
    void enregistrerEvenement("INVITATION_ENVOYEE", { via: "copie" });
    setTimeout(() => setCopie(false), 2000);
  }

  async function partager() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Rejoins-moi sur Assiettly",
          text: "Je suis mes macros avec Assiettly, l'app qui reconnaît les plats français. Un mois Premium offert pour nous deux si tu t'inscris avec mon lien :",
          url: url!,
        });
        void enregistrerEvenement("INVITATION_ENVOYEE", { via: "partage" });
      } catch {
        // AbortError si l'utilisateur ferme le menu de partage sans choisir — rien à faire.
      }
    } else {
      await copier();
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-creme-50 p-5 shadow-sm">
      <p className="truncate rounded-xl bg-white px-4 py-3 text-sm text-charbon-600">{url}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={copier}
          className="flex-1 rounded-2xl border border-charbon-400/20 bg-white py-3 font-titre font-semibold text-charbon-800"
        >
          {copie ? "Copié !" : "Copier le lien"}
        </button>
        <button
          type="button"
          onClick={partager}
          className="flex-1 rounded-2xl bg-corail-500 py-3 font-titre font-semibold text-white"
        >
          Partager
        </button>
      </div>
    </div>
  );
}
