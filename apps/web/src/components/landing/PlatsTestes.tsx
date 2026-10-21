"use client";

import Image from "next/image";
import { useState } from "react";
import { PLATS_DEMO } from "@/data/demoScanPlats";

const LIBELLE_CONFIANCE: Record<"elevee" | "moyenne" | "faible", string> = {
  elevee: "Confiance élevée",
  moyenne: "Confiance moyenne",
  faible: "Confiance faible",
};

// Couleurs choisies pour un contraste AA (4.5:1+) sur fond clair (creme-50) —
// ambre-500/corail-600 seuls échouent, cf. tailwind.config.ts.
const COULEUR_CONFIANCE: Record<"elevee" | "moyenne" | "faible", string> = {
  elevee: "text-sarcelle-600",
  moyenne: "text-ambre-700",
  faible: "text-corail-700",
};

// Deux plats seulement, montrés en détail complet — l'ardoise du hero liste
// déjà les 6 plats testés avec leur kcal ; répéter la même liste ici serait
// redondant. Un plat typique de la cuisine française complexe (bourguignon)
// et un plat "macros" pour le public sportif qui suit ses protéines.
const IDS_DETAIL = ["boeuf-bourguignon", "poulet-riz"] as const;

/**
 * Remplace l'ancien tableau comparatif générique : preuve vérifiable (vraies
 * photos, vrais résultats mesurés, jusqu'à l'ingrédient) plutôt qu'une
 * promesse "Oui" vs "Variable". Pas de nom de concurrent, pas de claim
 * d'hébergement — cf. audit landing (le pipeline de photos passe par un
 * prestataire IA hors UE, une affirmation "hébergement UE" non qualifiée
 * serait trompeuse ici).
 */
export function PlatsTestes() {
  const [chargees, setChargees] = useState<Set<string>>(new Set());
  const plats = PLATS_DEMO.filter((p) => IDS_DETAIL.includes(p.id as (typeof IDS_DETAIL)[number]) && p.resultat);

  return (
    <section id="plats-testes" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-sarcelle-600">Preuve, pas promesse</p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Les plats testés</h2>
      <p className="mt-2 max-w-md text-charbon-600">
        6 photos prises nous-mêmes, 6 résultats réels, obtenus par Assiettly. Voici le détail complet de deux d&apos;entre
        eux — le reste est sur l&apos;ardoise, juste au-dessus.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {plats.map((plat) => {
          const resultat = plat.resultat!;
          return (
            <div key={plat.id} className="overflow-hidden rounded-3xl bg-creme-50 shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-creme-100">
                <Image
                  src={plat.image}
                  alt={plat.nom}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className={`object-cover transition-opacity duration-300 motion-reduce:transition-none ${
                    chargees.has(plat.id) ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setChargees((s) => new Set(s).add(plat.id))}
                />
              </div>

              <div className="p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-titre text-lg font-semibold text-charbon-800">{plat.nom}</p>
                  <p className="font-titre text-xl font-bold text-charbon-800">{resultat.caloriesKcal} kcal</p>
                </div>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className={`text-sm font-medium ${COULEUR_CONFIANCE[resultat.confiance]}`}>
                    {LIBELLE_CONFIANCE[resultat.confiance]}
                  </p>
                  <p className="text-sm text-charbon-600">
                    P {Math.round(resultat.proteinesG)}g · G {Math.round(resultat.glucidesG)}g · L{" "}
                    {Math.round(resultat.lipidesG)}g
                  </p>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-charbon-400/15 pt-4">
                  {resultat.ingredients.map((ing) => (
                    <li key={ing.nom} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 text-charbon-600">
                        {ing.nom} <span className="text-charbon-400">· {ing.quantiteEstimee}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-charbon-400">{Math.round(ing.calories)} kcal</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-charbon-400">
        Résultats issus de nos tests sur ces photos — pas un direct. Un doute sur un ingrédient ? Corrige en 2 taps
        dans l&apos;app.
      </p>
    </section>
  );
}
