"use client";

import { useEffect, useState } from "react";
import { PLATS_DEMO } from "@/data/demoScanPlats";
import { genererCarteAssiette } from "@/lib/carteAssiette";

const PLAT = PLATS_DEMO.find((p) => p.id === "boeuf-bourguignon")!;

/**
 * "Dans l'app" — la landing ne montrait que du texte et l'ardoise, jamais
 * l'app elle-même (cf. brief viralité). Seule capture honnête possible sans
 * session authentifiée dans l'environnement de build : la carte de partage,
 * générée en vrai par le même code que celui utilisé après un scan réel
 * (lib/carteAssiette.ts) — pas une maquette statique. Les autres écrans
 * (dashboard, "Termine tes macros") demandent une vraie session pour une
 * capture honnête, pas encore possible depuis la landing elle-même.
 */
export function DansLApp() {
  const [urlImage, setUrlImage] = useState<string | null>(null);

  useEffect(() => {
    if (!PLAT.resultat) return;
    let urlActuelle: string | null = null;

    genererCarteAssiette({
      photoUrl: PLAT.image,
      nomPlat: PLAT.nom,
      caloriesKcal: PLAT.resultat.caloriesKcal,
      proteinesG: PLAT.resultat.proteinesG,
      glucidesG: PLAT.resultat.glucidesG,
      lipidesG: PLAT.resultat.lipidesG,
      streakJours: 0,
      premium: true,
    })
      .then((blob) => {
        urlActuelle = URL.createObjectURL(blob);
        setUrlImage(urlActuelle);
      })
      .catch(() => {});

    return () => {
      if (urlActuelle) URL.revokeObjectURL(urlActuelle);
    };
  }, []);

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-sarcelle-600">Dans l&rsquo;app</p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Ta carte de partage</h2>
      <p className="mt-2 max-w-md text-charbon-600">
        Après chaque scan, un tap suffit pour la partager en story — générée par l&rsquo;app elle-même, pas une
        maquette. En Premium, sans le lien Assiettly en bas.
      </p>

      <div className="mt-8 flex justify-center">
        {urlImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- image générée côté client (Canvas), pas un fichier /public
          <img
            src={urlImage}
            alt="Exemple de carte de partage générée par Assiettly : bœuf bourguignon, 621 kcal, détail des macros"
            className="w-full max-w-[280px] rounded-3xl shadow-xl"
          />
        ) : (
          <div className="aspect-[9/16] w-full max-w-[280px] animate-pulse rounded-3xl bg-creme-200" />
        )}
      </div>
    </section>
  );
}
