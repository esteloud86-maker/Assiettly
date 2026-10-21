"use client";

import { useState } from "react";
import { enregistrerEvenement } from "@/server/actions/analytics";
import { genererCarteAssiette, partagerOuTelecharger } from "@/lib/carteAssiette";

interface Props {
  photoDataUrl: string;
  nomPlat: string;
  caloriesKcal: number;
  proteinesG: number;
  glucidesG: number;
  lipidesG: number;
  streakJours: number;
  premium: boolean;
}

/**
 * Génère la carte de partage "Mon assiette" (cf. lib/carteAssiette.ts) et
 * l'envoie au menu de partage natif du téléphone — c'est ce qui finit posté
 * sur Instagram/TikTok, donc le moindre raté (bouton qui ne répond pas,
 * erreur silencieuse) coûte cher : état de chargement et message d'erreur
 * explicites plutôt qu'un bouton qui ne fait rien.
 */
export function BoutonPartagerCarte(props: Props) {
  const [etat, setEtat] = useState<"inactif" | "generation" | "erreur">("inactif");

  async function partager() {
    setEtat("generation");
    try {
      const blob = await genererCarteAssiette({
        photoUrl: props.photoDataUrl,
        nomPlat: props.nomPlat,
        caloriesKcal: props.caloriesKcal,
        proteinesG: props.proteinesG,
        glucidesG: props.glucidesG,
        lipidesG: props.lipidesG,
        streakJours: props.streakJours,
        premium: props.premium,
      });
      const resultat = await partagerOuTelecharger(blob, "mon-assiette-assiettly.png");
      void enregistrerEvenement("PARTAGE_CARTE", { resultat });
      setEtat("inactif");
    } catch (erreur) {
      // AbortError : l'utilisateur a simplement fermé le menu de partage
      // natif sans choisir — pas une erreur à signaler.
      if (erreur instanceof DOMException && erreur.name === "AbortError") {
        setEtat("inactif");
        return;
      }
      setEtat("erreur");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={partager}
        disabled={etat === "generation"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-charbon-400/20 bg-white py-3.5 font-titre font-semibold text-charbon-800 disabled:opacity-60"
      >
        {etat === "generation" ? "Préparation..." : "↗ Partager mon assiette"}
      </button>
      {etat === "erreur" ? (
        <p className="mt-2 text-center text-sm text-corail-600">Le partage a échoué, réessaie.</p>
      ) : null}
    </div>
  );
}
