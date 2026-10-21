"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { PLATS_DEMO } from "@/data/demoScanPlats";
import { genererCarteAssiette } from "@/lib/carteAssiette";

// Aperçu dev uniquement — jamais exposé en production (cf. no-emoji/placeholder
// pattern déjà utilisé ailleurs, ex. avis.dev.ts). Sert à visualiser le rendu
// réel de la carte de partage sans attendre un vrai scan + une vraie session,
// avec les vraies données du jeu de démo (pas de chiffre inventé).
const PLAT = PLATS_DEMO.find((p) => p.id === "boeuf-bourguignon")!;

export default function PreviewCartePage() {
  if (process.env.NODE_ENV === "production") notFound();

  const [urlImage, setUrlImage] = useState<string | null>(null);
  const [premium, setPremium] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!PLAT.resultat) return;
    let urlPrecedente: string | null = null;

    genererCarteAssiette({
      photoUrl: PLAT.image,
      nomPlat: PLAT.nom,
      caloriesKcal: PLAT.resultat.caloriesKcal,
      proteinesG: PLAT.resultat.proteinesG,
      glucidesG: PLAT.resultat.glucidesG,
      lipidesG: PLAT.resultat.lipidesG,
      streakJours: 12,
      premium,
    })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        urlPrecedente = url;
        setUrlImage(url);
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : String(e)));

    return () => {
      if (urlPrecedente) URL.revokeObjectURL(urlPrecedente);
    };
  }, [premium]);

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <p className="rounded-xl bg-corail-50 p-3 text-center text-sm font-semibold text-corail-700">
        [DEV UNIQUEMENT — jamais en production] Aperçu de la carte de partage "Mon assiette", générée avec les
        données réelles de la démo (bœuf bourguignon). Le streak (12 jours) est illustratif pour cet aperçu
        uniquement.
      </p>

      <label className="flex items-center gap-2 text-sm font-medium text-charbon-800">
        <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} />
        Aperçu Premium (sans filigrane)
      </label>

      {erreur ? <p className="text-corail-600">{erreur}</p> : null}
      {urlImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- aperçu dev d'une image générée côté client en mémoire
        <img src={urlImage} alt="Aperçu de la carte de partage" className="w-full rounded-2xl shadow-lg" />
      ) : (
        <p className="text-charbon-400">Génération...</p>
      )}
    </div>
  );
}
