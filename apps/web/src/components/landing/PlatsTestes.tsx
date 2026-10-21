"use client";

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

/**
 * Remplace l'ancien tableau comparatif générique : preuve vérifiable (6
 * vraies photos, 6 vrais résultats mesurés) plutôt qu'une promesse "Oui" vs
 * "Variable". Pas de nom de concurrent, pas de claim d'hébergement — cf.
 * audit landing (le pipeline de photos passe par un prestataire IA hors UE,
 * une affirmation "hébergement UE" non qualifiée serait trompeuse ici).
 */
export function PlatsTestes() {
  const [selectionId, setSelectionId] = useState<string | null>(null);
  const plats = PLATS_DEMO.filter((p) => p.resultat);
  const selection = plats.find((p) => p.id === selectionId) ?? null;

  return (
    <section id="plats-testes" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="font-chalk text-sm font-semibold text-sarcelle-600">Preuve, pas promesse</p>
      <h2 className="mt-1 font-titre text-3xl font-bold text-charbon-800">Les plats testés</h2>
      <p className="mt-2 max-w-md text-charbon-600">
        Pas une démo scriptée : {plats.length} photos prises nous-mêmes, {plats.length} vrais résultats mesurés par
        Assiettly. Touche un plat pour voir le détail.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {plats.map((plat) => {
          const actif = plat.id === selectionId;
          return (
            <button
              key={plat.id}
              type="button"
              onClick={() => setSelectionId(actif ? null : plat.id)}
              aria-pressed={actif}
              className={`overflow-hidden rounded-2xl bg-creme-50 text-left shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-corail-500 ${
                actif ? "ring-2 ring-corail-500" : ""
              }`}
            >
              <div className="aspect-[4/3] w-full bg-creme-100">
                {/* eslint-disable-next-line @next/next/no-img-element -- photo déposée à la main dans /public */}
                <img src={plat.image} alt={plat.nom} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <p className="font-titre text-sm font-semibold leading-snug text-charbon-800">{plat.nom}</p>
                <p className="mt-0.5 text-sm text-charbon-600">{plat.resultat!.caloriesKcal} kcal</p>
              </div>
            </button>
          );
        })}
      </div>

      {selection?.resultat ? (
        <div className="mt-5 rounded-2xl bg-creme-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <div>
              <p className="font-titre font-semibold text-charbon-800">{selection.nom}</p>
              <p className={`mt-0.5 text-sm font-medium ${COULEUR_CONFIANCE[selection.resultat.confiance]}`}>
                {LIBELLE_CONFIANCE[selection.resultat.confiance]}
              </p>
            </div>
            <p className="text-sm text-charbon-600">
              P {Math.round(selection.resultat.proteinesG)}g · G {Math.round(selection.resultat.glucidesG)}g · L{" "}
              {Math.round(selection.resultat.lipidesG)}g
            </p>
          </div>

          <ul className="mt-4 space-y-1.5 border-t border-charbon-400/15 pt-4">
            {selection.resultat.ingredients.map((ing) => (
              <li key={ing.nom} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-charbon-600">
                  {ing.nom} <span className="text-charbon-400">· {ing.quantiteEstimee}</span>
                </span>
                <span className="shrink-0 tabular-nums text-charbon-400">{Math.round(ing.calories)} kcal</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-charbon-400">
        Résultats issus de nos tests sur ces photos — pas un direct. Un doute sur un ingrédient ? Corrige en 2 taps
        dans l'app.
      </p>
    </section>
  );
}
